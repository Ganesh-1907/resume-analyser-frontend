import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../api/api'
import { Brain, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import './AuthPages.css'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password })
      if (res.data.success) {
        signIn(res.data.user, res.data.token)
        navigate('/dashboard')
      } else {
        setError(res.data.error || 'Registration failed')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.')
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

          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Start practicing smarter interviews today</p>

          {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input type="text" className="form-input with-icon" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input type="email" className="form-input with-icon" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input type={showPass ? 'text' : 'password'} className="form-input with-icon with-toggle"
                  placeholder="At least 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input type={showPass ? 'text' : 'password'} className="form-input with-icon"
                  placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="divider">or</div>

          <p className="auth-switch">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
