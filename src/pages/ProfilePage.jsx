import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../api/api'
import {
  User, Mail, Calendar, FileText, TrendingUp, Award,
  Edit2, Save, X, ChevronDown, ChevronUp, Shield
} from 'lucide-react'
import './ProfilePage.css'

function getRatingColor(score) {
  if (score >= 0.75) return 'badge-green'
  if (score >= 0.5) return 'badge-orange'
  return 'badge-red'
}

export default function ProfilePage() {
  const { user, signIn, token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedReport, setExpandedReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await getProfile()
      if (res.data.success) {
        setProfile(res.data.user)
        setEditName(res.data.user.name)
      }
    } catch {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      await updateProfile({ name: editName.trim() })
      signIn({ ...user, name: editName.trim() }, token)
      setProfile(prev => ({ ...prev, name: editName.trim() }))
      setEditing(false)
    } catch {
      setError('Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="profile-page page-wrapper">
      <div className="loading-overlay"><div className="spinner" style={{ width: 48, height: 48 }} /><p>Loading profile...</p></div>
    </div>
  )

  const reports = profile?.reports || []
  const avgScore = reports.length > 0
    ? reports.reduce((a, r) => a + (r.overall_score || 0), 0) / reports.length
    : 0

  return (
    <div className="profile-page page-wrapper">
      <div className="profile-bg" />
      <div className="container">
        <div className="profile-header animate-fade-up">
          <h1>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Manage your account and view interview history</p>
        </div>

        {error && <div className="alert alert-error mb-16"><span>⚠️</span>{error}<button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={16} /></button></div>}

        <div className="profile-layout">
          {/* Left: User card */}
          <div className="profile-sidebar">
            <div className="user-card glass-card animate-fade-up">
              <div className="user-avatar-lg">
                {(profile?.name || user?.name || 'U').charAt(0).toUpperCase()}
              </div>

              {editing ? (
                <div className="edit-name-form">
                  <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)}
                    placeholder="Your name" style={{ textAlign: 'center' }} />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveName} disabled={saving}>
                      {saving ? '...' : <><Save size={14} /> Save</>}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(false); setEditName(profile?.name || '') }}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ marginBottom: '4px' }}>{profile?.name || user?.name}</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ marginTop: '10px' }}>
                    <Edit2 size={13} /> Edit Name
                  </button>
                </div>
              )}

              <div className="profile-meta">
                <div className="meta-row">
                  <Mail size={15} color="var(--text-secondary)" />
                  <span>{profile?.email || user?.email}</span>
                </div>
                <div className="meta-row">
                  <Calendar size={15} color="var(--text-secondary)" />
                  <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}</span>
                </div>
                <div className="meta-row">
                  <Shield size={15} color="var(--accent-green)" />
                  <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 600 }}>Verified Account</span>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="stats-card glass-card animate-fade-up">
              <h4 style={{ marginBottom: '16px' }}>Performance Summary</h4>
              <div className="stat-rows">
                <div className="stat-row">
                  <span>Total Interviews</span>
                  <span className="stat-row-val">{reports.length}</span>
                </div>
                <div className="stat-row">
                  <span>Average Score</span>
                  <span className="stat-row-val">{Math.round(avgScore * 100)}%</span>
                </div>
                <div className="stat-row">
                  <span>Best Score</span>
                  <span className="stat-row-val">
                    {reports.length > 0 ? `${Math.round(Math.max(...reports.map(r => r.overall_score || 0)) * 100)}%` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Reports */}
          <div className="reports-section">
            <div className="reports-header">
              <h3><FileText size={20} /> Interview History</h3>
              <span className="badge badge-purple">{reports.length} session{reports.length !== 1 ? 's' : ''}</span>
            </div>

            {reports.length === 0 ? (
              <div className="no-reports glass-card animate-fade-up">
                <TrendingUp size={48} color="rgba(139,92,246,0.3)" />
                <h4>No interviews yet</h4>
                <p>Complete your first AI interview to see your report here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reports.map((report, i) => (
                  <div key={report.id} className="report-card glass-card animate-fade-up">
                    <div className="report-card-header" onClick={() => setExpandedReport(expandedReport === i ? null : i)}>
                      <div style={{ display: 'flex', align: 'center', gap: '16px', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="report-type-icon" data-type={report.interview_type || 'audio'}>
                          {report.interview_type === 'video' ? '🎥' : '🎤'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {report.interview_type === 'video' ? 'Video' : 'Audio'} Interview
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            {report.resume_name && ` · ${report.resume_name}`}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <p style={{ fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 800, textAlign: 'right' }}>
                            {Math.round((report.overall_score || 0) * 100)}%
                          </p>
                          <span className={`badge ${getRatingColor(report.overall_score || 0)}`} style={{ fontSize: '0.7rem' }}>
                            {report.rating || 'N/A'}
                          </span>
                        </div>
                        {expandedReport === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {expandedReport === i && (
                      <div className="report-card-body">
                        <div className="report-mini-stats">
                          <div><span>Questions</span><strong>{report.total_questions}</strong></div>
                        </div>
                        {report.skills?.length > 0 && (
                          <div style={{ margin: '12px 0' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>Skills tested</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {report.skills.slice(0, 10).map(s => <span key={s} className="badge badge-purple" style={{ fontSize: '0.72rem' }}>{s}</span>)}
                            </div>
                          </div>
                        )}
                        {report.recommendations?.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>Top recommendation</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', background: 'rgba(245,158,11,0.06)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-orange)' }}>
                              {report.recommendations[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
