import { useState, useEffect } from 'react'

export default function Hero({ onBook }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 200) }, [])

  return (
    <section id="home" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(165deg, #0F0E0C 0%, #1A1714 40%, #0F0E0C 100%)',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '10%', right: '-10%', width: 600, height: 600,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,149,106,0.06) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', left: '-5%', width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,106,74,0.05) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div style={{
        textAlign: 'center', maxWidth: 720, padding: '120px 32px 80px',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1.2s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.3em',
          color: 'var(--accent)', marginBottom: 32,
        }}>Mental Health & Well-Being</div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 1.1,
          color: 'var(--text-primary)', margin: '0 0 24px',
        }}>
          Unlock the<br />
          <span style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 500 }}>
            best version
          </span>
          <br />of you
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.7,
          color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 48px',
        }}>
          360° support through evidence-based therapy, psychological assessments,
          and personalized treatment plans for healing, resilience, and growth.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onBook} style={{
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius-pill)',
            padding: '16px 40px', cursor: 'pointer',
            transition: 'transform 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(196,149,106,0.3)' }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none' }}
          >Book a Session</button>

          <button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.15em',
              background: 'transparent', color: 'var(--accent)',
              border: '1px solid var(--accent-border-hover)', borderRadius: 'var(--radius-pill)',
              padding: '16px 40px', cursor: 'pointer', transition: 'all 0.3s',
            }}
          >Learn More</button>
        </div>

        <div style={{
          marginTop: 64, display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap',
        }}>
          {[['NLP', 'Neuro-Linguistic'], ['CBT', 'Behavioral'], ['EMDR', 'Trauma'], ['HT', 'Hypnotherapy']].map(([a, b]) => (
            <div key={a} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
                color: 'var(--accent)',
              }}>{a}</div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 11,
                color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>{b}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
