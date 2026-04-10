const SERVICES = [
  {
    title: 'Neuro-Linguistic Programming',
    desc: 'Reprogram limiting thought patterns and behaviors through language-based techniques that unlock your mind\'s potential for positive change.',
    icon: '◇',
  },
  {
    title: 'Cognitive Behavioral Therapy',
    desc: 'Evidence-based approach to identify and restructure negative thinking patterns, building healthier emotional responses and coping strategies.',
    icon: '○',
  },
  {
    title: 'EMDR Therapy',
    desc: 'Process and heal from traumatic experiences through guided bilateral stimulation, reducing emotional distress tied to difficult memories.',
    icon: '△',
  },
  {
    title: 'Hypnotherapy',
    desc: 'Access your subconscious mind in a safe, guided state of deep relaxation to address anxiety, habits, pain, and emotional blocks.',
    icon: '□',
  },
]

export default function Services() {
  return (
    <section id="services" style={{
      background: 'var(--bg-primary)', padding: '120px 32px',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.3em',
          color: 'var(--accent)', marginBottom: 20,
        }}>Services</div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.2,
          color: 'var(--text-primary)', margin: '0 0 56px', maxWidth: 500,
        }}>
          Tailored <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>therapeutic</span> modalities
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20,
        }}>
          {SERVICES.map((s, i) => (
            <div key={i} style={{
              padding: '36px 28px',
              background: 'var(--bg-card)',
              border: '1px solid rgba(196,149,106,0.08)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-card-hover)'
              e.currentTarget.style.borderColor = 'rgba(196,149,106,0.2)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-card)'
              e.currentTarget.style.borderColor = 'rgba(196,149,106,0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 32,
                color: 'rgba(196,149,106,0.3)', marginBottom: 16, lineHeight: 1,
              }}>{s.icon}</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 8,
              }}>{s.title}</div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7,
                color: 'var(--text-muted)', margin: 0,
              }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing card */}
        <div style={{
          marginTop: 56, textAlign: 'center', padding: '40px 32px',
          background: 'rgba(196,149,106,0.04)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500,
            color: 'var(--text-secondary)', marginBottom: 8,
          }}>Consultation</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 14,
            color: 'var(--text-muted)', marginBottom: 4,
          }}>1 Hour Session</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600,
            color: 'var(--accent)', marginBottom: 4,
          }}>₱1,500</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: 'var(--text-faint)',
          }}>per session · online or in-person</div>
        </div>
      </div>
    </section>
  )
}
