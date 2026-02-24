import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Upload, Mic, Video, FileText, Star, ChevronRight, ArrowRight,
  Brain, Zap, Shield, Clock, TrendingUp, CheckCircle
} from 'lucide-react'
import './LandingPage.css'

const STEPS = [
  { icon: Upload, color: '#8b5cf6', title: 'Upload Resume', desc: 'Upload your PDF or DOCX resume. Our AI extracts your skills, experience, and expertise instantly.' },
  { icon: Brain, color: '#3b82f6', title: 'AI Analysis', desc: 'Advanced NLP analyzes your resume and prepares 10 tailored interview questions matching your skillset.' },
  { icon: Mic, color: '#06b6d4', title: 'Smart Interview', desc: 'Choose audio or video interview mode. Answer questions at your own pace with AI recording.' },
  { icon: TrendingUp, color: '#10b981', title: 'Get Your Report', desc: 'Receive a comprehensive score, detailed feedback, and actionable recommendations. Download as PDF.' },
]

const FEATURES = [
  { icon: Zap, title: 'Instant Analysis', desc: 'Sub-second skill extraction from PDF and DOCX resumes using advanced NLP' },
  { icon: Mic, title: 'Audio Interview', desc: 'Record your spoken answers; AI transcribes and evaluates content accuracy' },
  { icon: Video, title: 'Video Interview', desc: 'Full webcam interview with facial analysis and posture tracking' },
  { icon: Brain, title: 'AI Evaluation', desc: 'Semantic similarity matching compares your answers to ideal responses' },
  { icon: FileText, title: 'PDF Download', desc: 'Generate and download a professional PDF report of your full interview' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data stays safe. Files are deleted after processing automatically' },
]

const STATS = [
  { value: '10K+', label: 'Interviews Conducted' },
  { value: '95%', label: 'User Satisfaction' },
  { value: '3 min', label: 'Average Upload Time' },
  { value: '50+', label: 'Skill Categories' },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-fade-up">
              <Star size={14} fill="currentColor" /> AI-Powered Career Platform
            </div>
            <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Ace Your Interview with <span className="gradient-text">AI Intelligence</span>
            </h1>
            <p className="hero-desc animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Upload your resume, get intelligent interview questions tailored to your skills,
              practice with audio or video recording, and receive a detailed performance report with PDF export.
            </p>
            <div className="hero-actions animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to={user ? '/dashboard' : '/signup'} className="btn btn-primary btn-lg">
                {user ? 'Go to Dashboard' : 'Start For Free'} <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                See How It Works
              </a>
            </div>
            <div className="hero-stats animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {STATS.map((stat) => (
                <div key={stat.label} className="stat-item">
                  <span className="stat-value gradient-text">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Process</span>
            <h2>How It Works</h2>
            <p>Four simple steps to land your dream job</p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={step.title} className="step-card glass-card">
                <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-icon" style={{ background: step.color + '22', color: step.color }}>
                  <step.icon size={28} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < STEPS.length - 1 && <div className="step-connector"><ChevronRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Modes */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Interview Modes</span>
            <h2>Choose Your Interview Style</h2>
            <p>Practice with the format that suits you best</p>
          </div>

          <div className="mode-cards">
            <div className="mode-card glass-card audio-mode">
              <div className="mode-icon"><Mic size={40} /></div>
              <h3>Audio Interview</h3>
              <p>Perfect for practicing your verbal communication. Record your spoken answers and get them transcribed and scored by AI.</p>
              <ul className="mode-features">
                <li><CheckCircle size={16} /> AI speech-to-text transcription</li>
                <li><CheckCircle size={16} /> Audio quality analysis</li>
                <li><CheckCircle size={16} /> Content accuracy scoring</li>
                <li><CheckCircle size={16} /> Keyword detection</li>
              </ul>
              <Link to={user ? '/dashboard' : '/signup'} className="btn btn-outline">
                Try Audio Interview <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mode-card glass-card video-mode">
              <div className="mode-icon"><Video size={40} /></div>
              <h3>Video Interview</h3>
              <p>Simulate a real interview experience. Record video responses and receive feedback on both content and presentation.</p>
              <ul className="mode-features">
                <li><CheckCircle size={16} /> Full video recording</li>
                <li><CheckCircle size={16} /> Facial expression analysis</li>
                <li><CheckCircle size={16} /> Posture & eye contact scoring</li>
                <li><CheckCircle size={16} /> Professional presence rating</li>
              </ul>
              <Link to={user ? '/dashboard' : '/signup'} className="btn btn-outline" style={{ '--accent-purple': '#06b6d4' }}>
                Try Video Interview <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2>Everything You Need</h2>
            <p>Powered by state-of-the-art AI models</p>
          </div>

          <div className="grid-3">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="feature-card glass-card">
                <div className="feature-icon">
                  <feat.icon size={24} />
                </div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card glass-card">
            <div className="cta-glow" />
            <h2>Ready to Ace Your Next Interview?</h2>
            <p>Join thousands of candidates who've improved their interview performance with ResumeAI</p>
            <Link to={user ? '/dashboard' : '/signup'} className="btn btn-primary btn-lg">
              {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
