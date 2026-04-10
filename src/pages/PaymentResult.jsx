import { useSearchParams, Link } from 'react-router-dom'

export function PaymentSuccess() {
  const [params] = useSearchParams()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 32,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
          background: 'rgba(80,180,100,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
        }}>✓</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500,
          color: 'var(--text-primary)', margin: '0 0 12px',
        }}>Booking Confirmed</h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7,
          color: 'var(--text-muted)', margin: '0 0 32px',
        }}>
          Your payment was successful and your session has been scheduled.
          You'll receive a confirmation email with the Google Calendar invite shortly.
        </p>
        <Link to="/" style={{
          display: 'inline-block', padding: '14px 32px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
          color: 'var(--bg-primary)', borderRadius: 'var(--radius-pill)',
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          textDecoration: 'none',
        }}>Back to Home</Link>
      </div>
    </div>
  )
}

export function PaymentFailed() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 32,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
          background: 'rgba(220,60,60,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
        }}>✕</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500,
          color: 'var(--text-primary)', margin: '0 0 12px',
        }}>Payment Failed</h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7,
          color: 'var(--text-muted)', margin: '0 0 32px',
        }}>
          Something went wrong with your payment. Your booking has not been confirmed.
          Please try again or contact us for assistance.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/#book" style={{
            display: 'inline-block', padding: '14px 32px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            color: 'var(--bg-primary)', borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            textDecoration: 'none',
          }}>Try Again</Link>
          <a href="https://wa.me/639193746888" target="_blank" rel="noopener" style={{
            display: 'inline-block', padding: '14px 32px',
            border: '1px solid var(--accent-border-hover)',
            color: 'var(--accent)', borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            textDecoration: 'none',
          }}>Contact Us</a>
        </div>
      </div>
    </div>
  )
}
