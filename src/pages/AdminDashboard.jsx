import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getAllBookings, updateBookingStatus, cancelBooking } from '../lib/bookings'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

const STATUS_COLORS = {
  confirmed: { bg: 'rgba(80,180,100,0.12)', text: '#5CB870', border: 'rgba(80,180,100,0.25)' },
  pending_payment: { bg: 'rgba(220,180,60,0.12)', text: '#DCB43C', border: 'rgba(220,180,60,0.25)' },
  cancelled: { bg: 'rgba(220,60,60,0.1)', text: '#E86060', border: 'rgba(220,60,60,0.2)' },
  completed: { bg: 'rgba(120,140,160,0.1)', text: '#8898A8', border: 'rgba(120,140,160,0.2)' },
}

const TIME_LABELS = {
  '09:00': '9:00 AM', '10:00': '10:00 AM', '11:00': '11:00 AM',
  '13:00': '1:00 PM', '14:00': '2:00 PM', '15:00': '3:00 PM', '16:00': '4:00 PM',
}

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('list') // list | calendar
  const [selectedBooking, setSelectedBooking] = useState(null)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const data = await getAllBookings(
        filter !== 'all' ? { status: filter } : {}
      )
      setBookings(data)
    } catch (err) {
      console.error(err)
      // Demo data when Supabase isn't connected
      setBookings([
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
        {
          id: '3', booking_date: '2026-04-14', time_slot: '10:00',
          client_name: 'Ana Reyes', client_email: 'ana@email.com',
          client_phone: '+63 919 555 1234', status: 'confirmed',
          amount: 150000, notes: 'Follow-up session',
          created_at: '2026-04-09T15:00:00Z',
        },
      ])
    }
    setLoading(false)
  }

  useEffect(() => { fetchBookings() }, [filter])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus)
      fetchBookings()
      setSelectedBooking(null)
    } catch (err) {
      console.error(err)
      // Update locally for demo
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
      setSelectedBooking(null)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await cancelBooking(id)
      fetchBookings()
      setSelectedBooking(null)
    } catch (err) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
      setSelectedBooking(null)
    }
  }

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending_payment').length,
    revenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.amount || 0), 0) / 100,
  }

  const StatusBadge = ({ status }) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.completed
    return (
      <span style={{
        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
        background: c.bg, color: c.text, border: `1px solid ${c.border}`,
        textTransform: 'capitalize',
      }}>{status.replace('_', ' ')}</span>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid rgba(196,149,106,0.1)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            color: 'var(--text-primary)',
          }}>B</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18,
            color: 'var(--text-secondary)',
          }}>Dashboard</span>
        </div>
        <button onClick={signOut} style={{
          background: 'none', border: '1px solid rgba(196,149,106,0.2)',
          borderRadius: 'var(--radius-sm)', padding: '8px 16px', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)',
        }}>Sign Out</button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 40,
        }}>
          {[
            { label: 'Total Bookings', value: stats.total, color: 'var(--text-secondary)' },
            { label: 'Confirmed', value: stats.confirmed, color: '#5CB870' },
            { label: 'Pending Payment', value: stats.pending, color: '#DCB43C' },
            { label: 'Revenue', value: `₱${stats.revenue.toLocaleString()}`, color: 'var(--accent)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '24px', borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid rgba(196,149,106,0.06)',
            }}>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
              }}>{s.label}</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600,
                color: s.color,
              }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'confirmed', 'pending_payment', 'cancelled', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                background: filter === f ? 'var(--accent-light)' : 'transparent',
                border: filter === f
                  ? '1px solid rgba(196,149,106,0.3)'
                  : '1px solid rgba(196,149,106,0.08)',
                color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontSize: 13,
                textTransform: 'capitalize',
              }}>{f.replace('_', ' ')}</button>
            ))}
          </div>
          <button onClick={fetchBookings} style={{
            padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
            background: 'transparent',
            border: '1px solid rgba(196,149,106,0.15)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontSize: 13,
          }}>Refresh</button>
        </div>

        {/* Bookings list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-faint)' }}>
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 60, color: 'var(--text-faint)',
            border: '1px dashed rgba(196,149,106,0.15)', borderRadius: 'var(--radius-lg)',
          }}>No bookings found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map(booking => (
              <div key={booking.id} onClick={() => setSelectedBooking(
                selectedBooking?.id === booking.id ? null : booking
              )} style={{
                padding: '20px 24px', borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: selectedBooking?.id === booking.id
                  ? '1px solid rgba(196,149,106,0.3)'
                  : '1px solid rgba(196,149,106,0.06)',
                cursor: 'pointer', transition: 'all 0.3s',
              }}>
                {/* Row summary */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
                        color: 'var(--text-secondary)',
                      }}>{booking.client_name}</div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-faint)',
                        marginTop: 2,
                      }}>
                        {booking.booking_date} · {TIME_LABELS[booking.time_slot] || booking.time_slot}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                      color: 'var(--accent)',
                    }}>₱{((booking.amount || 0) / 100).toLocaleString()}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>

                {/* Expanded details */}
                {selectedBooking?.id === booking.id && (
                  <div style={{
                    marginTop: 20, paddingTop: 20,
                    borderTop: '1px solid rgba(196,149,106,0.08)',
                  }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 16, marginBottom: 20,
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>Email</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{booking.client_email}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>Phone</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{booking.client_phone}</div>
                      </div>
                      {booking.notes && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>Notes</div>
                          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{booking.notes}</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {booking.status === 'pending_payment' && (
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(booking.id, 'confirmed') }}
                          style={{
                            padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
                            background: 'rgba(80,180,100,0.15)', border: '1px solid rgba(80,180,100,0.3)',
                            color: '#5CB870', fontSize: 13, fontFamily: 'var(--font-body)',
                          }}>Mark Confirmed</button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(booking.id, 'completed') }}
                          style={{
                            padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
                            background: 'rgba(120,140,160,0.1)', border: '1px solid rgba(120,140,160,0.2)',
                            color: '#8898A8', fontSize: 13, fontFamily: 'var(--font-body)',
                          }}>Mark Completed</button>
                      )}
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button onClick={(e) => { e.stopPropagation(); handleCancel(booking.id) }}
                          style={{
                            padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
                            background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.15)',
                            color: '#E86060', fontSize: 13, fontFamily: 'var(--font-body)',
                          }}>Cancel</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
