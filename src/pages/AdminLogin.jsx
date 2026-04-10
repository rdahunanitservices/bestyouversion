import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function AdminLogin() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(232,221,208,0.04)',
    border: '1px solid rgba(196,149,106,0.12)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)', fontSize: 14,
    outline: 'none', transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 32,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
            color: 'var(--text-primary)',
          }}>B</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500,
            color: 'var(--text-primary)', margin: '0 0 8px',
          }}>Admin</h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14,
            color: 'var(--text-faint)',
          }}>Sign in to manage bookings</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', marginBottom: 20, borderRadius: 'var(--radius-sm)',
            background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.2)',
            color: '#E86060', fontSize: 14, textAlign: 'center',
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent-border-hover)'}
            onBlur={e => e.target.style.borderColor = 'rgba(196,149,106,0.12)'}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent-border-hover)'}
            onBlur={e => e.target.style.borderColor = 'rgba(196,149,106,0.12)'}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          />
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius-pill)',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            opacity: loading ? 0.7 : 1, marginTop: 8,
          }}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </div>
      </div>
    </div>
  )
}
