import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/api'
import { Brain, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import './AuthPages.css'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email: form.email, password: form.password })
      if (res.data.success) {
        signIn(res.data.user, res.data.token)
        navigate('/dashboard')
      } else {
        setError(res.data.error || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-bg" />
      <div className="auth-container">
        <div className="auth-card glass-card animate-fade-up">
          <div className="auth-logo">
            <div className="brand-icon-lg">
              <Brain size={30} color="white" />
            </div>
            <span className="gradient-text" style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 700 }}>ResumeAI</span>
          </div>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue your interview journey</p>

          {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input with-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input with-icon with-toggle"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</> : <>Sign in <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="divider">or</div>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
