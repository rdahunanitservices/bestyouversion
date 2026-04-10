// supabase/functions/paymongo-webhook/index.ts
// Deploy with: supabase functions deploy paymongo-webhook
//
// Required secrets:
//   PAYMONGO_WEBHOOK_SECRET=whsk_xxxx
//   GOOGLE_CALENDAR_ID=your-calendar@gmail.com
//   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
//
// Setup:
// 1. In PayMongo Dashboard → Webhooks → Add Endpoint
//    URL: https://<project>.supabase.co/functions/v1/paymongo-webhook
//    Events: checkout_session.payment.paid
//
// 2. In Google Cloud Console:
//    - Create a Service Account
//    - Download JSON key
//    - Share your Google Calendar with the service account email
//    - Set the JSON as GOOGLE_SERVICE_ACCOUNT_JSON secret

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Google Calendar Helper ───────────────────────────────────

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson)

  // Create JWT
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encoder = new TextEncoder()

  // Base64URL encode
  const b64url = (data: Uint8Array) =>
    btoa(String.fromCharCode(...data))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

  const headerB64 = b64url(encoder.encode(JSON.stringify(header)))
  const claimB64 = b64url(encoder.encode(JSON.stringify(claim)))
  const signInput = `${headerB64}.${claimB64}`

  // Import private key and sign
  const pemContent = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '')

  const keyData = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signInput)
  )

  const jwt = `${signInput}.${b64url(new Uint8Array(signature))}`

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

async function createCalendarEvent(booking: any): Promise<string | null> {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
  const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID')

  if (!serviceAccountJson || !calendarId) {
    console.log('Google Calendar not configured — skipping event creation')
    return null
  }

  try {
    const accessToken = await getGoogleAccessToken(serviceAccountJson)

    // Build event datetime
    const startDateTime = `${booking.booking_date}T${booking.time_slot}:00`
    const [hours, minutes] = booking.time_slot.split(':').map(Number)
    const endHours = hours + 1
    const endDateTime = `${booking.booking_date}T${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`

    const event = {
      summary: `Session: ${booking.client_name}`,
      description: [
        `Client: ${booking.client_name}`,
        `Email: ${booking.client_email}`,
        `Phone: ${booking.client_phone}`,
        booking.notes ? `Notes: ${booking.notes}` : '',
        `Payment: Confirmed via PayMongo`,
        `Booking ID: ${booking.id}`,
      ].filter(Boolean).join('\n'),
      start: {
        dateTime: startDateTime,
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Asia/Manila',
      },
      attendees: [
        { email: booking.client_email, displayName: booking.client_name },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    }

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!calRes.ok) {
      const errText = await calRes.text()
      console.error('Google Calendar error:', errText)
      return null
    }

    const calData = await calRes.json()
    console.log('Calendar event created:', calData.id)
    return calData.id

  } catch (err) {
    console.error('Calendar event creation failed:', err)
    return null
  }
}

// ─── Webhook Handler ──────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const eventType = body?.data?.attributes?.type

    console.log('Webhook received:', eventType)

    // We only care about successful payments
    if (eventType !== 'checkout_session.payment.paid') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract payment data
    const checkoutData = body.data.attributes.data
    const checkoutId = checkoutData?.id
    const metadata = checkoutData?.attributes?.metadata
    const bookingId = metadata?.booking_id
    const paymentMethod = checkoutData?.attributes?.payment_method_used

    if (!bookingId) {
      console.error('No booking_id in metadata')
      return new Response(JSON.stringify({ error: 'Missing booking_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      console.error('Booking not found:', bookingId)
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Skip if already confirmed (idempotency)
    if (booking.status === 'confirmed') {
      return new Response(JSON.stringify({ received: true, already_confirmed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Google Calendar event
    const calendarEventId = await createCalendarEvent(booking)

    // Update booking status to confirmed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_id: checkoutId,
        payment_method: paymentMethod || 'unknown',
        google_calendar_event_id: calendarEventId,
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Failed to update booking:', updateError)
      throw updateError
    }

    console.log(`Booking ${bookingId} confirmed. Calendar event: ${calendarEventId}`)

    return new Response(
      JSON.stringify({ success: true, bookingId, calendarEventId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
