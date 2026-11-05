import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Creates a PayMongo checkout session via Supabase Edge Function.
 */
export async function createCheckoutSession(bookingData) {
  if (!isSupabaseConfigured) {
    // Demo mode — show alert instead of redirecting
    return { checkoutUrl: null, isDemo: true }
  }

  // Only the booking id is sent. The Edge Function reads the price and
  // client details from the booking itself.
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      bookingId: bookingData.id,
    },
  })

  if (error) throw error
  return data
}
