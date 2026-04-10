import { useParams, Link } from 'react-router-dom'
import { THERAPY_PAGES } from '../data/content'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function TherapyPage() {
  const { type } = useParams()
  const page = THERAPY_PAGES[type]

  if (!page) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text-primary)', marginBottom: 16 }}>Page not found</h1>
          <Link to="/" style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)', fontSize: 14 }}>Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '140px 32px 80px', maxWidth: 760, margin: '0 auto' }}>
        <Link to="/#services" style={{
          fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)',
          textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24, display: 'inline-block',
        }}>← Back to Services</Link>

        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.3em',
          color: 'var(--accent)', marginBottom: 16,
        }}>{page.subtitle}</div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.15,
          color: 'var(--text-primary)', margin: '0 0 32px',
        }}>{page.title}</h1>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.8,
          color: 'var(--text-muted)', margin: '0 0 60px',
        }}>{page.intro}</p>

        {/* Sections */}
        {page.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500,
              color: 'var(--text-secondary)', margin: '0 0 16px',
            }}>{s.heading}</h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.8,
              color: 'var(--text-muted)', margin: 0,
            }}>{s.content}</p>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          marginTop: 40, padding: '40px 32px', textAlign: 'center',
          background: 'rgba(196,149,106,0.04)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500,
            color: 'var(--text-secondary)', marginBottom: 16,
          }}>Ready to begin?</div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)',
            marginBottom: 24, maxWidth: 400, margin: '0 auto 24px',
          }}>Book a consultation session and take the first step toward transformation.</p>
          <a href="https://calendly.com/ademarcutang/mental-health-and-well-being-session" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', padding: '14px 36px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            color: 'var(--bg-primary)', borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none',
          }}>Book a Session</a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
