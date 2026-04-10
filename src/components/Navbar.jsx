import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { id: 'home', path: '/', label: 'Home' },
  { id: 'about', path: '/#about', label: 'About' },
  { id: 'services', path: '/#services', label: 'Services' },
  { id: 'articles', path: '/articles', label: 'Articles', isPage: true },
  { id: 'book', path: '/#book', label: 'Book' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleNav = (link) => {
    setMobileOpen(false)
    if (link.isExternal) {
      window.open(link.path, '_blank', 'noopener,noreferrer')
    } else if (link.path === '/') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        navigate('/')
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
      }
    } else if (location.pathname !== '/' && link.path.startsWith('/#')) {
      navigate('/')
      setTimeout(() => {
        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (link.path.startsWith('/#')) {
      document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(link.path)
    }
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(15,14,12,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
      borderBottom: scrolled ? '1px solid rgba(210,190,160,0.1)' : '1px solid transparent',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
      }}>
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => handleNav(NAV_LINKS[0])}
        >
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Best You Version" style={{
            width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
          }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20,
            color: 'var(--text-secondary)', letterSpacing: '0.02em',
          }}>Best You Version</span>
        </div>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}
          className="nav-desktop">
          {NAV_LINKS.map(link => (
            <button key={link.id} onClick={() => handleNav(link)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              transition: 'color 0.3s', padding: '4px 0',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >{link.label}</button>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="nav-mobile-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none', background: 'none', border: 'none',
            color: 'var(--text-secondary)', fontSize: 24, cursor: 'pointer',
          }}
        >{mobileOpen ? '✕' : '☰'}</button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(15,14,12,0.97)', padding: '16px 32px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {NAV_LINKS.map(link => (
            <button key={link.id} onClick={() => handleNav(link)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              textAlign: 'left', padding: '8px 0',
            }}>{link.label}</button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}