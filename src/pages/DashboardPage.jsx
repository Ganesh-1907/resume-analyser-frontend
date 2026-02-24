import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { uploadResume, startInterview } from '../api/api'
import {
  Upload, FileText, Mic, Video, CheckCircle, ChevronRight,
  Sparkles, X, Brain, Clock
} from 'lucide-react'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=upload, 2=skills, 3=choose
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState([])
  const [resumeData, setResumeData] = useState(null)
  const [interviewType, setInterviewType] = useState(null)
  const [starting, setStarting] = useState(false)

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSetFile(dropped)
  }, [])

  const validateAndSetFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are supported')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB')
      return
    }
    setError('')
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('name', user.name)
      const res = await uploadResume(fd)
      if (res.data.success) {
        setSkills(res.data.top_skills || [])
        setResumeData(res.data)
        setStep(2)
      } else {
        setError(res.data.error || 'Upload failed')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Check backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartInterview = async () => {
    if (!interviewType) return
    setStarting(true)
    try {
      const res = await startInterview()
      if (res.data.success) {
        navigate(`/interview/${interviewType}`, {
          state: { totalQuestions: res.data.total_questions, skills: res.data.skills_for_interview, interviewType }
        })
      } else {
        setError(res.data.error || 'Failed to start interview')
        setStarting(false)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview')
      setStarting(false)
    }
  }

  return (
    <div className="dashboard page-wrapper">
      <div className="dashboard-bg" />
      <div className="container">
        {/* Header */}
        <div className="dashboard-header animate-fade-up">
          <div>
            <h1>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              {step === 1 ? 'Upload your resume to get started' : step === 2 ? 'Review your extracted skills' : 'Choose your interview mode'}
            </p>
          </div>
          <div className="step-indicator">
            {['Upload', 'Review', 'Start'].map((label, i) => (
              <div key={label} className={`step-dot ${step > i ? 'completed' : step === i + 1 ? 'active' : ''}`}>
                <span className="step-dot-num">{step > i ? <CheckCircle size={14} /> : i + 1}</span>
                <span className="step-dot-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-error mb-16" style={{ marginBottom: '16px' }}><span>⚠️</span>{error}<button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={16} /></button></div>}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="upload-section animate-fade-up">
            <div
              className={`drop-zone glass-card ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !file && document.getElementById('file-input').click()}
            >
              <input id="file-input" type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && validateAndSetFile(e.target.files[0])} />

              {file ? (
                <div className="file-preview">
                  <FileText size={48} color="var(--accent-purple)" />
                  <div>
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); setFile(null) }}>
                    <X size={14} /> Remove
                  </button>
                </div>
              ) : (
                <div className="drop-content">
                  <div className="drop-icon animate-float">
                    <Upload size={40} />
                  </div>
                  <h3>Drop your resume here</h3>
                  <p>or click to browse files</p>
                  <span className="badge badge-purple">PDF & DOCX supported</span>
                </div>
              )}
            </div>

            <div className="upload-actions">
              <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={!file || loading}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing...</> : <><Brain size={18} /> Analyze Resume</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && resumeData && (
          <div className="skills-section animate-fade-up">
            <div className="skills-card glass-card">
              <div className="skills-header">
                <div>
                  <h2>Skills Extracted <span className="badge badge-purple">{resumeData.total_skills} found</span></h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Our AI identified these skills from your resume</p>
                </div>
                <Sparkles size={32} color="var(--accent-purple)" />
              </div>
              <div className="skills-cloud">
                {skills.map((skill, i) => (
                  <span key={skill} className="skill-tag" style={{ animationDelay: `${i * 0.04}s` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="interview-info glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="var(--accent-orange)" />
                <div>
                  <p style={{ fontWeight: 600 }}>Interview Overview</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>10 tailored questions based on your skills · 15-30 minutes</p>
                </div>
              </div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
              Choose Interview Mode <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Choose Mode */}
        {step === 3 && (
          <div className="mode-select animate-fade-up">
            <div className="mode-grid">
              <div
                className={`mode-option glass-card ${interviewType === 'audio' ? 'selected' : ''}`}
                onClick={() => setInterviewType('audio')}
              >
                <div className="mode-option-icon audio-color">
                  <Mic size={36} />
                </div>
                <h3>Audio Interview</h3>
                <p>Record spoken answers. AI transcribes and evaluates your verbal responses in real-time.</p>
                <ul>
                  <li>✓ Speech-to-text transcription</li>
                  <li>✓ Content accuracy scoring</li>
                  <li>✓ Audio quality analysis</li>
                </ul>
                {interviewType === 'audio' && <div className="selected-badge"><CheckCircle size={20} /> Selected</div>}
              </div>

              <div
                className={`mode-option glass-card ${interviewType === 'video' ? 'selected' : ''}`}
                onClick={() => setInterviewType('video')}
              >
                <div className="mode-option-icon video-color">
                  <Video size={36} />
                </div>
                <h3>Video Interview</h3>
                <p>Full webcam interview simulating real environments with video and audio recording.</p>
                <ul>
                  <li>✓ Video + audio capture</li>
                  <li>✓ Facial expression analysis</li>
                  <li>✓ Professional presence score</li>
                </ul>
                {interviewType === 'video' && <div className="selected-badge video-selected"><CheckCircle size={20} /> Selected</div>}
              </div>
            </div>

            <div className="start-actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={handleStartInterview} disabled={!interviewType || starting}>
                {starting ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Starting...</> : <>Start Interview <ChevronRight size={18} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
