import { useState, useEffect } from 'react'
import { format, addDays, isSunday } from 'date-fns'
import { getAvailableSlots, createBooking } from '../lib/bookings'
import { createCheckoutSession } from '../lib/paymongo'

const TIME_LABELS = {
  '09:00': '9:00 AM',
  '10:00': '10:00 AM',
  '11:00': '11:00 AM',
  '13:00': '1:00 PM',
  '14:00': '2:00 PM',
  '15:00': '3:00 PM',
  '16:00': '4:00 PM',
}

function getNext14Days() {
  const days = []
  const now = new Date()
  for (let i = 1; i <= 14; i++) {
    const d = addDays(now, i)
    if (!isSunday(d)) days.push(d)
  }
  return days
}

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState(1)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)

  const days = getNext14Days()

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSelectedTime(null)

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    getAvailableSlots(dateStr)
      .then(slots => setAvailableSlots(slots))
      .catch(() => {
        // Fallback: show all slots if Supabase isn't configured yet
        setAvailableSlots(Object.keys(TIME_LABELS))
      })
      .finally(() => setLoadingSlots(false))
  }, [selectedDate])

  const handlePay = async () => {
    if (!name || !email || !phone) return
    setPaying(true)
    setError(null)

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      // 1. Create booking in Supabase
      const booking = await createBooking({
        date: dateStr,
        time: selectedTime,
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        notes,
      })

      // 2. Create PayMongo checkout session
      const { checkoutUrl } = await createCheckoutSession({
        id: booking.id,
        amount: 150000,
        date: format(selectedDate, 'MMM d, yyyy'),
        time: TIME_LABELS[selectedTime],
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
      })

      // 3. Redirect to PayMongo checkout
      window.location.href = checkoutUrl
    } catch (err) {
      console.error('Booking error:', err)
      setError('Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(196,149,106,0.12)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)', fontSize: 14,
    outline: 'none', transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  }

  return (
    <section id="book" style={{
      background: 'var(--bg-secondary)', padding: '120px 32px',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.3em',
          color: 'var(--accent)', marginBottom: 20,
        }}>Book a session</div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.2,
          color: 'var(--text-primary)', margin: '0 0 48px',
        }}>
          Begin your <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>journey</span>
        </h2>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: s <= step ? 'var(--accent)' : 'rgba(196,149,106,0.15)',
              transition: 'background 0.4s',
            }} />
          ))}
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', marginBottom: 20, borderRadius: 'var(--radius-sm)',
            background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.2)',
            color: '#E86060', fontSize: 14,
          }}>{error}</div>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              color: 'var(--text-secondary)', marginBottom: 20,
            }}>Select a date</div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10,
              marginBottom: 32,
            }}>
              {days.map((d, i) => {
                const isSelected = selectedDate?.toDateString() === d.toDateString()
                return (
                  <button key={i} onClick={() => setSelectedDate(d)} style={{
                    padding: '14px 8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: isSelected ? 'var(--accent-light)' : 'var(--bg-card)',
                    border: isSelected
                      ? '1px solid rgba(196,149,106,0.4)'
                      : '1px solid rgba(196,149,106,0.08)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    transition: 'all 0.3s',
                  }}>{format(d, 'EEE, MMM d')}</button>
                )
              })}
            </div>

            {selectedDate && (
              <>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                  color: 'var(--text-secondary)', marginBottom: 16,
                }}>Select a time</div>

                {loadingSlots ? (
                  <div style={{ color: 'var(--text-faint)', fontSize: 14, marginBottom: 32 }}>
                    Loading available slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div style={{ color: 'var(--text-faint)', fontSize: 14, marginBottom: 32 }}>
                    No available slots for this date. Please choose another date.
                  </div>
                ) : (
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10,
                    marginBottom: 32,
                  }}>
                    {availableSlots.map(t => {
                      const isSelected = selectedTime === t
                      return (
                        <button key={t} onClick={() => setSelectedTime(t)} style={{
                          padding: '12px 8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          background: isSelected ? 'var(--accent-light)' : 'var(--bg-card)',
                          border: isSelected
                            ? '1px solid rgba(196,149,106,0.4)'
                            : '1px solid rgba(196,149,106,0.08)',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-body)', fontSize: 13,
                          transition: 'all 0.3s',
                        }}>{TIME_LABELS[t] || t}</button>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {selectedDate && selectedTime && (
              <button onClick={() => setStep(2)} style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Continue</button>
            )}
          </div>
        )}

        {/* Step 2: Client details */}
        {step === 2 && (
          <div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              color: 'var(--text-secondary)', marginBottom: 20,
            }}>Your details</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <input placeholder="Full name" value={name}
                onChange={e => setName(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border-hover)'}
                onBlur={e => e.target.style.borderColor = 'rgba(196,149,106,0.12)'} />
              <input placeholder="Email address" type="email" value={email}
                onChange={e => setEmail(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border-hover)'}
                onBlur={e => e.target.style.borderColor = 'rgba(196,149,106,0.12)'} />
              <input placeholder="Phone / Viber / WhatsApp" value={phone}
                onChange={e => setPhone(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border-hover)'}
                onBlur={e => e.target.style.borderColor = 'rgba(196,149,106,0.12)'} />
              <textarea placeholder="Notes or concerns (optional)" value={notes}
                onChange={e => setNotes(e.target.value)} rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border-hover)'}
                onBlur={e => e.target.style.borderColor = 'rgba(196,149,106,0.12)'} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: '16px',
                background: 'transparent', color: 'var(--accent)',
                border: '1px solid var(--accent-border-hover)', borderRadius: 'var(--radius-pill)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              }}>Back</button>
              <button
                onClick={() => { if (name && email && phone) setStep(3) }}
                style={{
                  flex: 2, padding: '16px',
                  background: name && email && phone
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
                    : 'rgba(196,149,106,0.2)',
                  color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius-pill)',
                  cursor: name && email && phone ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>Review & Pay</button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Pay */}
        {step === 3 && (
          <div>
            <div style={{
              padding: '32px 28px', borderRadius: 'var(--radius-lg)',
              background: 'rgba(196,149,106,0.04)',
              border: '1px solid var(--accent-border)',
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                color: 'var(--text-secondary)', marginBottom: 20,
              }}>Booking summary</div>

              {[
                ['Date', selectedDate ? format(selectedDate, 'EEE, MMM d, yyyy') : ''],
                ['Time', TIME_LABELS[selectedTime] || selectedTime],
                ['Duration', '1 hour'],
                ['Client', name],
                ['Email', email],
                ['Phone', phone],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                  borderBottom: '1px solid rgba(196,149,106,0.06)',
                }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{val}</span>
                </div>
              ))}

              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '16px 0 0',
                marginTop: 8,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}>Total</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
                  color: 'var(--accent)',
                }}>₱1,500</span>
              </div>
            </div>

            {notes && (
              <div style={{
                padding: '16px 20px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid rgba(196,149,106,0.06)',
                marginBottom: 24,
              }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>Notes</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>{notes}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, padding: '16px',
                background: 'transparent', color: 'var(--accent)',
                border: '1px solid var(--accent-border-hover)', borderRadius: 'var(--radius-pill)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              }}>Back</button>
              <button onClick={handlePay} disabled={paying} style={{
                flex: 2, padding: '16px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius-pill)',
                cursor: paying ? 'wait' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                opacity: paying ? 0.7 : 1,
              }}>{paying ? 'Processing...' : 'Pay with PayMongo'}</button>
            </div>

            <div style={{
              marginTop: 20, textAlign: 'center',
              fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-ghost)',
            }}>
              Accepts GCash · Maya · Credit/Debit Cards
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
