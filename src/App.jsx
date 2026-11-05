import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import BookingSection from './components/BookingSection'
import Footer from './components/Footer'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import TherapyPage from './pages/TherapyPage'
import { ArticlesPage, ArticlePage } from './pages/ArticlesPage'
import { PaymentSuccess, PaymentFailed } from './pages/PaymentResult'
import PrivacyPage from './pages/PrivacyPage'

function HomePage() {
  const scrollToBook = () => {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />
      <Hero onBook={scrollToBook} />
      <About />
      <Services />
      <BookingSection />
      <Footer />
    </>
  )
}

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', color: 'var(--text-faint)',
        fontFamily: 'var(--font-body)', fontSize: 14,
      }}>Loading...</div>
    )
  }

  if (!user) return <AdminLogin />

  // Signed in, but not on the admin allow-list (public.admin_users).
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 16,
        alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
        background: 'var(--bg-primary)', color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)', fontSize: 14,
      }}>
        <p style={{ margin: 0 }}>This account ({user.email}) does not have admin access.</p>
        <button onClick={() => signOut().catch(console.error)} style={{
          padding: '10px 24px', borderRadius: 20, cursor: 'pointer',
          background: 'transparent', border: '1px solid var(--accent-border-hover)',
          color: 'var(--accent)', fontFamily: 'var(--font-body)', fontSize: 13,
        }}>Sign out</button>
      </div>
    )
  }

  return <AdminDashboard />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/therapy/:type" element={<TherapyPage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/articles/:id" element={<ArticlePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
      <Route path="/privacy" element={<PrivacyPage />} />
    </Routes>
  )
}
