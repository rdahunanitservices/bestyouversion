// supabase/functions/create-checkout/index.ts
// Deploy with: supabase functions deploy create-checkout
//
// Required secrets (set via Supabase Dashboard → Edge Functions → Secrets):
//   PAYMONGO_SECRET_KEY=sk_test_xxxx or sk_live_xxxx

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingId, amount, description, clientName, clientEmail, clientPhone } = await req.json()

    const PAYMONGO_SECRET = Deno.env.get('PAYMONGO_SECRET_KEY')
    if (!PAYMONGO_SECRET) {
      throw new Error('PayMongo secret key not configured')
    }

    // Get the origin for success/fail redirects
    const origin = req.headers.get('origin') || 'https://www.bestyouversion.com'

    // Create PayMongo Checkout Session
    const paymongoRes = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(PAYMONGO_SECRET + ':')}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: {
              name: clientName,
              email: clientEmail,
              phone: clientPhone,
            },
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            description: description,
            line_items: [
              {
                currency: 'PHP',
                amount: amount,       // in centavos
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
            success_url: `${origin}/payment/success?booking_id=${bookingId}`,
            cancel_url: `${origin}/payment/failed?booking_id=${bookingId}`,
            metadata: {
              booking_id: bookingId,
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

    // Update booking with checkout session ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    await supabase
      .from('bookings')
      .update({ payment_id: checkoutId })
      .eq('id', bookingId)

    return new Response(
      JSON.stringify({ checkoutUrl, checkoutId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
