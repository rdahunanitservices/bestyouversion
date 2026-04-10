import { supabase } from './supabase'

/**
 * Creates a PayMongo checkout session by calling a Supabase Edge Function.
 * The edge function handles the secret key — frontend only sends booking data.
 */
export async function createCheckoutSession(bookingData) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      bookingId: bookingData.id,
      amount: bookingData.amount, // in centavos (150000 = ₱1,500)
      description: `Consultation - ${bookingData.date} at ${bookingData.time}`,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
    },
  })

  if (error) throw error
  return data // { checkoutUrl: 'https://checkout.paymongo.com/...' }
}

/**
 * Check payment status for a booking
 */
export async function checkPaymentStatus(bookingId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('payment_status, payment_id')
    .eq('id', bookingId)
    .single()

  if (error) throw error
  return data
}
