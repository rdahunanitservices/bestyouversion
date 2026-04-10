import { supabase } from './supabase'

/**
 * Fetch available time slots for a given date.
 * Returns times that are NOT already booked.
 */
export async function getAvailableSlots(date) {
  const ALL_SLOTS = [
    '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00',
  ]

  // Get booked slots for this date
  const { data: booked, error } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('booking_date', date)
    .in('status', ['confirmed', 'pending_payment'])

  if (error) throw error

  const bookedTimes = (booked || []).map(b => b.time_slot)
  return ALL_SLOTS.filter(s => !bookedTimes.includes(s))
}

/**
 * Create a new booking (status = pending_payment)
 */
export async function createBooking({ date, time, clientName, clientEmail, clientPhone, notes }) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_date: date,
      time_slot: time,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      notes: notes || null,
      status: 'pending_payment',
      amount: 150000, // ₱1,500 in centavos
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all bookings (admin)
 */
export async function getAllBookings({ status, from, to } = {}) {
  let query = supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: true })
    .order('time_slot', { ascending: true })

  if (status) query = query.eq('status', status)
  if (from) query = query.gte('booking_date', from)
  if (to) query = query.lte('booking_date', to)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Update booking status (admin)
 */
export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Cancel a booking (admin)
 */
export async function cancelBooking(bookingId) {
  return updateBookingStatus(bookingId, 'cancelled')
}
