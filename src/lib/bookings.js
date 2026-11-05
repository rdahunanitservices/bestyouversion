import { supabase, isSupabaseConfigured } from './supabase'

const ALL_SLOTS = [
  '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00',
]

/**
 * Fetch available time slots for a given date.
 */
export async function getAvailableSlots(date) {
  if (!isSupabaseConfigured) return ALL_SLOTS

  // The bookings table is admin-only; this function returns taken slots only.
  const { data: booked, error } = await supabase
    .rpc('get_booked_slots', { p_date: date })

  if (error) throw error

  const bookedTimes = (booked || []).map(b => b.time_slot)
  return ALL_SLOTS.filter(s => !bookedTimes.includes(s))
}

/**
 * Create a new booking
 */
export async function createBooking({ date, time, clientName, clientEmail, clientPhone, notes }) {
  if (!isSupabaseConfigured) {
    // Return a mock booking for demo/offline mode
    return {
      id: 'demo-' + Date.now(),
      booking_date: date,
      time_slot: time,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      notes: notes || null,
      status: 'pending_payment',
      amount: 150000,
    }
  }

  // create_booking() validates the input and sets status/amount server-side.
  const { data: id, error } = await supabase.rpc('create_booking', {
    p_date: date,
    p_time: time,
    p_name: clientName,
    p_email: clientEmail,
    p_phone: clientPhone,
    p_notes: notes || null,
  })

  if (error) {
    const err = new Error(error.message)
    // Messages raised by create_booking() are written for the visitor.
    if (error.code === 'P0001') err.userMessage = error.message
    throw err
  }

  return {
    id,
    booking_date: date,
    time_slot: time,
    client_name: clientName,
    client_email: clientEmail,
    client_phone: clientPhone,
    notes: notes || null,
    status: 'pending_payment',
    amount: 150000,
  }
}

/**
 * Get all bookings (admin)
 */
export async function getAllBookings({ status, from, to } = {}) {
  if (!isSupabaseConfigured) {
    return [
      {
        id: '1', booking_date: '2026-04-12', time_slot: '09:00',
        client_name: 'Maria Santos', client_email: 'maria@email.com',
        client_phone: '+63 917 123 4567', status: 'confirmed',
        amount: 150000, notes: 'First session, anxiety management',
        created_at: '2026-04-10T08:00:00Z',
      },
      {
        id: '2', booking_date: '2026-04-12', time_slot: '14:00',
        client_name: 'Juan Cruz', client_email: 'juan@email.com',
        client_phone: '+63 918 765 4321', status: 'pending_payment',
        amount: 150000, notes: null,
        created_at: '2026-04-10T10:30:00Z',
      },
    ]
  }

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
  if (!isSupabaseConfigured) return { id: bookingId, status }

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
