import { useParams, Link } from 'react-router-dom'
import { ARTICLES } from '../data/content'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export function ArticlesPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <section style={{ padding: '140px 32px 80px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.3em',
          color: 'var(--accent)', marginBottom: 16,
        }}>Insights</div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.15,
          color: 'var(--text-primary)', margin: '0 0 56px',
        }}>Articles</h1>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24,
        }}>
          {ARTICLES.map(article => (
            <Link to={`/articles/${article.id}`} key={article.id} style={{
              textDecoration: 'none',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              background: 'var(--bg-card)',
              border: '1px solid rgba(196,149,106,0.08)',
              transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(196,149,106,0.25)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(196,149,106,0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <img src={article.image} alt={article.title}
                style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '24px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
                  color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.3,
                }}>{article.title}</h2>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6,
                  color: 'var(--text-muted)', margin: 0,
                }}>{article.excerpt}</p>
                <div style={{
                  marginTop: 16, fontFamily: 'var(--font-body)', fontSize: 13,
                  fontWeight: 500, color: 'var(--accent)',
                }}>Read more →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export function ArticlePage() {
  const { id } = useParams()
  const article = ARTICLES.find(a => a.id === id)

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text-primary)', marginBottom: 16 }}>Article not found</h1>
          <Link to="/articles" style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)', fontSize: 14 }}>Back to Articles</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <article style={{ padding: '140px 32px 80px', maxWidth: 700, margin: '0 auto' }}>
        <Link to="/articles" style={{
          fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)',
          textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 32, display: 'inline-block',
        }}>← Back to Articles</Link>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 400,
          fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.2,
          color: 'var(--text-primary)', margin: '0 0 32px',
        }}>{article.title}</h1>

        <img src={article.image} alt={article.title} style={{
          width: '100%', height: 300, objectFit: 'cover',
          borderRadius: 'var(--radius-xl)', marginBottom: 40,
          border: '1px solid var(--accent-border)',
        }} />

        {article.content.split('\n\n').map((para, i) => (
          <p key={i} style={{
            fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.9,
            color: 'var(--text-muted)', margin: '0 0 24px',
          }}>{para}</p>
        ))}

        {/* CTA */}
        <div style={{
          marginTop: 48, padding: '40px 32px', textAlign: 'center',
          background: 'rgba(196,149,106,0.04)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
            color: 'var(--text-secondary)', marginBottom: 12,
          }}>Want to explore this further?</div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)',
            marginBottom: 20, maxWidth: 400, margin: '0 auto 20px',
          }}>Book a session with Ade and start your transformative journey.</p>
          <a href="/#book" style={{
            display: 'inline-block', padding: '14px 36px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            color: 'var(--bg-primary)', borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none',
          }}>Book a Session</a>
        </div>
      </article>
      <Footer />
    </div>
  )
}
