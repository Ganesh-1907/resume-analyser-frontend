import { Link } from 'react-router-dom'
import { Brain, Github, Twitter, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '60px 0 30px',
      marginTop: '80px'
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '40px' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'var(--gradient-main)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(139,92,246,0.4)'
              }}>
                <Brain size={20} color="white" />
              </div>
              <span style={{
                fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: '700',
                background: 'var(--gradient-main)', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>ResumeAI</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
              AI-powered resume analysis and intelligent interview coaching to land your dream job.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Features', 'How it Works', 'Pricing'].map(item => (
                <a key={item} href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent-purple)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >{item}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/signin" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>Sign In</Link>
              <Link to="/signup" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>Sign Up</Link>
              <Link to="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/profile" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>Profile</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connect</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.color = 'var(--accent-purple)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            © 2026 ResumeAI. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Made with <Heart size={14} color="#ef4444" fill="#ef4444" /> for job seekers
          </p>
        </div>
      </div>
    </footer>
  )
}
