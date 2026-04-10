export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-tertiary)', padding: '60px 32px 40px',
      borderTop: '1px solid rgba(196,149,106,0.06)',
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
            color: 'var(--text-secondary)', marginBottom: 12,
          }}>Best You Version</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.8,
            color: 'var(--text-faint)',
          }}>
            ade@bestyouversion.com<br />
            +63 919 374 6888<br />
            Viber · WhatsApp
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: 'var(--text-ghost)', alignSelf: 'flex-end',
        }}>
          © {new Date().getFullYear()} Best You Version. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
