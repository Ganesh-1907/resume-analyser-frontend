import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain, Menu, X, User, LogOut, LayoutDashboard, FileText } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <div className="brand-icon">
            <Brain size={22} color="white" />
          </div>
          <span className="brand-name">ResumeAI</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link>
          {user && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                <User size={15} /> Profile
              </Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/signin" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
