// supabase/functions/create-checkout/index.ts
// Deploy with: supabase functions deploy create-checkout
//
// Required secrets (set via Supabase Dashboard → Edge Functions → Secrets):
//   PAYMONGO_SECRET_KEY=sk_test_xxxx or sk_live_xxxx
// Optional:
//   ALLOWED_ORIGINS=https://www.bestyouversion.com,https://bestyouversion.com
//     (sites PayMongo may send the client back to; others fall back to the first)
//
// The browser sends only { bookingId }. Price, client details and the
// description are read from the booking row, so they can't be tampered with.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Called from the browser. No cookies are involved, and the unguessable
// booking id is what grants access, so '*' is acceptable here.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const DEFAULT_ORIGINS = [
  'https://www.bestyouversion.com',
  'https://bestyouversion.com',
  'https://rdahunanitservices.github.io',
  'http://localhost:3000',
]

const TIME_LABELS: Record<string, string> = {
  '09:00': '9:00 AM',
  '10:00': '10:00 AM',
  '11:00': '11:00 AM',
  '13:00': '1:00 PM',
  '14:00': '2:00 PM',
  '15:00': '3:00 PM',
  '16:00': '4:00 PM',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function allowedOrigins(): string[] {
  const fromEnv = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean)
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ORIGINS
}

function describe(bookingDate: string, timeSlot: string): string {
  const d = new Date(`${bookingDate}T00:00:00Z`)
  const dateLabel = Number.isNaN(d.getTime())
    ? bookingDate
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  return `Consultation - ${dateLabel} at ${TIME_LABELS[timeSlot] ?? timeSlot}`
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    let bookingId: unknown
    try {
      ({ bookingId } = await req.json())
    } catch {
      return json({ error: 'Invalid request' }, 400)
    }
    if (typeof bookingId !== 'string' || !UUID_RE.test(bookingId)) {
      return json({ error: 'Invalid booking' }, 400)
    }

    const PAYMONGO_SECRET = Deno.env.get('PAYMONGO_SECRET_KEY')
    if (!PAYMONGO_SECRET) {
      throw new Error('PayMongo secret key not configured')
    }
    const paymongoAuth = `Basic ${btoa(PAYMONGO_SECRET + ':')}`

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Everything we charge for comes from the database, not the request.
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, booking_date, time_slot, client_name, client_email, client_phone, status, amount, payment_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!booking) {
      return json({ error: 'Booking not found' }, 404)
    }
    if (booking.status !== 'pending_payment') {
      return json({ error: 'This booking is no longer awaiting payment.' }, 409)
    }

    const amount = Number(booking.amount)
    if (!Number.isInteger(amount) || amount < 2000) {
      throw new Error(`Booking ${booking.id} has an invalid amount`)
    }

    // Reuse a still-open checkout (double clicks, back button) instead of
    // opening a new one each time.
    if (booking.payment_id) {
      const existingRes = await fetch(
        `https://api.paymongo.com/v1/checkout_sessions/${encodeURIComponent(booking.payment_id)}`,
        { headers: { Accept: 'application/json', Authorization: paymongoAuth } },
      )
      if (existingRes.ok) {
        const existing = await existingRes.json()
        const attrs = existing?.data?.attributes
        if (attrs?.status === 'active' && attrs?.checkout_url) {
          return json({ checkoutUrl: attrs.checkout_url, checkoutId: existing.data.id })
        }
      }
    }

    // Only send the client back to one of our own sites.
    const origins = allowedOrigins()
    const requestOrigin = (req.headers.get('origin') ?? '').replace(/\/+$/, '')
    const origin = origins.includes(requestOrigin) ? requestOrigin : origins[0]

    // Create PayMongo Checkout Session
    const paymongoRes = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': paymongoAuth,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: {
              name: booking.client_name,
              email: booking.client_email,
              phone: booking.client_phone,
            },
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            description: describe(booking.booking_date, booking.time_slot),
            line_items: [
              {
                currency: 'PHP',
                amount: amount,       // in centavos, from the booking row
                name: 'Consultation Session (1 Hour)',
                quantity: 1,
              },
            ],
            payment_method_types: [
              'gcash',
              'grab_pay',
              'paymaya',
              'card',
              'dob',
              'dob_ubp',
              'brankas_bdo',
              'brankas_landbank',
              'brankas_metrobank',
            ],
            success_url: `${origin}/payment/success?booking_id=${booking.id}`,
            cancel_url: `${origin}/payment/failed?booking_id=${booking.id}`,
            metadata: {
              booking_id: booking.id,
            },
          },
        },
      }),
    })

    if (!paymongoRes.ok) {
      const errBody = await paymongoRes.text()
      console.error('PayMongo error:', errBody)
      throw new Error(`PayMongo API error: ${paymongoRes.status}`)
    }

    const paymongoData = await paymongoRes.json()
    const checkoutUrl = paymongoData.data.attributes.checkout_url
    const checkoutId = paymongoData.data.id

    // Update booking with checkout session ID (only while still unpaid)
    await supabase
      .from('bookings')
      .update({ payment_id: checkoutId })
      .eq('id', booking.id)
      .eq('status', 'pending_payment')

    return new Response(
      JSON.stringify({ checkoutUrl, checkoutId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    return json({ error: 'Could not start checkout. Please try again.' }, 400)
  }
})
