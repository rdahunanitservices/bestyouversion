// supabase/functions/paymongo-webhook/index.ts
// Deploy with: supabase functions deploy paymongo-webhook
//
//   PayMongo calls this without a Supabase JWT, so deploy it with:
//   supabase functions deploy paymongo-webhook --no-verify-jwt
//   (The Paymongo-Signature check below is what authenticates the caller.)
//
// Required secrets:
//   PAYMONGO_WEBHOOK_SECRET=whsk_xxxx   (from the PayMongo webhook you register)
//   PAYMONGO_SECRET_KEY=sk_live_xxxx    (used to re-fetch the checkout session)
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
import { modeOfSecretKey, verifyPaymongoSignature } from '../_shared/paymongo-signature.ts'

// CORS '*' is harmless here: PayMongo calls this server-to-server and every
// request must carry a valid signature.
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

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders })
}

type SessionPayment = {
  id?: string
  attributes?: {
    amount?: number
    currency?: string
    status?: string
    source?: { type?: string } | null
  }
}

type CheckoutSession = {
  id: string
  attributes: {
    status?: string
    payment_method_used?: string | null
    metadata?: { booking_id?: string } | null
    payments?: SessionPayment[]
  }
}

async function getCheckoutSession(checkoutId: string, secretKey: string): Promise<CheckoutSession> {
  const res = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${encodeURIComponent(checkoutId)}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${btoa(secretKey + ':')}`,
    },
  })
  if (!res.ok) throw new Error(`PayMongo checkout session lookup failed: ${res.status}`)
  const body = await res.json()
  if (!body?.data?.id || !body?.data?.attributes) throw new Error('PayMongo returned an unexpected checkout session')
  return body.data as CheckoutSession
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const webhookSecret = Deno.env.get('PAYMONGO_WEBHOOK_SECRET') ?? ''
  const paymongoSecret = Deno.env.get('PAYMONGO_SECRET_KEY') ?? ''
  if (!webhookSecret || !paymongoSecret) {
    console.error('PAYMONGO_WEBHOOK_SECRET / PAYMONGO_SECRET_KEY not set; refusing webhook')
    return json({ error: 'Webhook not configured' }, 503)
  }

  // 1. Verify the signature over the RAW body before trusting anything in it.
  const rawBody = await req.text()
  const signatureOk = await verifyPaymongoSignature(
    rawBody,
    req.headers.get('paymongo-signature'),
    webhookSecret,
    { mode: modeOfSecretKey(paymongoSecret) },
  )
  if (!signatureOk) {
    console.warn('Rejected webhook: missing, stale or invalid Paymongo-Signature')
    return json({ error: 'Invalid signature' }, 401)
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const eventType = body?.data?.attributes?.type
  console.log('Webhook received:', eventType)

  // We only care about successful payments
  if (eventType !== 'checkout_session.payment.paid') {
    return json({ received: true })
  }

  const checkoutId = body?.data?.attributes?.data?.id
  if (typeof checkoutId !== 'string' || !/^cs_[A-Za-z0-9]+$/.test(checkoutId)) {
    return json({ error: 'Missing checkout session id' }, 400)
  }

  try {
    // 2. Re-fetch the session with our secret key. Booking id, payment status
    //    and amount come from PayMongo's API, not from the event body.
    const session = await getCheckoutSession(checkoutId, paymongoSecret)
    const bookingId = session.attributes.metadata?.booking_id
    const payment = (session.attributes.payments ?? []).find((p) => p?.attributes?.status === 'paid')

    if (!bookingId || !payment) {
      console.error('Checkout session is not paid or has no booking_id', { checkoutId })
      return json({ received: true, result: 'not-paid' })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!booking) {
      console.error('NEEDS MANUAL REVIEW: paid checkout for unknown booking', { checkoutId, bookingId })
      return json({ received: true, result: 'not-found' })
    }

    // Idempotency: PayMongo retries, and this may run twice for one payment.
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return json({ received: true, already_confirmed: true })
    }

    // 3. Never accept less than the booking's own amount (set server-side).
    const paidAmount = Number(payment.attributes?.amount ?? 0)
    const currency = payment.attributes?.currency
    if (paidAmount < Number(booking.amount) || (currency && currency.toUpperCase() !== 'PHP')) {
      console.error('NEEDS MANUAL REVIEW: paid amount does not match booking', {
        checkoutId, bookingId, paidAmount, currency, bookingAmount: booking.amount,
      })
      return json({ received: true, result: 'amount-mismatch' })
    }

    const paymentMethod = session.attributes.payment_method_used || payment.attributes?.source?.type || 'unknown'

    if (booking.status !== 'pending_payment') {
      // Cancelled while the client was paying. Record the money, but leave it
      // cancelled: the slot may belong to someone else now. Refund or restore
      // it from the dashboard.
      await supabase
        .from('bookings')
        .update({ payment_id: checkoutId, payment_method: paymentMethod })
        .eq('id', bookingId)
      console.error('NEEDS MANUAL REVIEW: payment received for a cancelled booking', { checkoutId, bookingId })
      return json({ received: true, result: 'paid-but-cancelled' })
    }

    // 4. Claim the pending -> confirmed transition atomically, so concurrent
    //    retries can't both send calendar invites.
    const { data: claimed, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_id: checkoutId,
        payment_method: paymentMethod,
      })
      .eq('id', bookingId)
      .eq('status', 'pending_payment')
      .select('id')

    if (updateError) {
      console.error('Failed to update booking:', updateError)
      throw updateError
    }
    if (!claimed || claimed.length === 0) {
      return json({ received: true, already_confirmed: true })
    }

    // Create Google Calendar event
    const calendarEventId = await createCalendarEvent(booking)
    if (calendarEventId) {
      await supabase
        .from('bookings')
        .update({ google_calendar_event_id: calendarEventId })
        .eq('id', bookingId)
    }

    console.log(`Booking ${bookingId} confirmed. Calendar event: ${calendarEventId}`)
    return json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    // 500 makes PayMongo retry later.
    return json({ error: 'Temporary failure' }, 500)
  }
})
