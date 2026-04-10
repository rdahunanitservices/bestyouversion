export default function About() {
  return (
    <section id="about" style={{
      background: 'var(--bg-secondary)', padding: '120px 32px',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.3em',
          color: 'var(--accent)', marginBottom: 20,
        }}>About</div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.2,
          color: 'var(--text-primary)', margin: '0 0 40px', maxWidth: 560,
        }}>
          Empowering minds through{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>science-backed</span> therapy
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40,
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
              color: 'var(--text-secondary)', margin: '0 0 12px',
            }}>Our philosophy</h3>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.8,
              color: 'var(--text-muted)', margin: 0,
            }}>
              We believe in the power of the mind and its ability to heal and transform.
              Using NLP, CBT, EMDR, and Hypnotherapy, we empower individuals to take control
              of their thoughts and emotions — guiding them toward lasting positive change.
            </p>
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
              color: 'var(--text-secondary)', margin: '0 0 12px',
            }}>Our approach</h3>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.8,
              color: 'var(--text-muted)', margin: 0,
            }}>
              Our approach is holistic and integrative, incorporating mindfulness,
              evidence-based practices, and personalized treatment plans. We work
              collaboratively to identify your goals and develop a path to achieving them.
            </p>
          </div>
        </div>

        {/* Therapist card */}
        <div style={{
          marginTop: 60, padding: '40px 48px',
          background: 'rgba(196,149,106,0.04)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
              color: 'var(--text-primary)', flexShrink: 0,
            }}>A</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>Ade Marcutang</div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'var(--text-muted)', marginTop: 4,
              }}>NLP Practitioner · CBT Therapist · EMDR · Clinical Hypnotherapist</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
