import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getInterviewSummary, saveReport } from '../api/api'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  Download, Star, TrendingUp, Award, AlertCircle,
  CheckCircle, ChevronDown, ChevronUp, Home, RefreshCw
} from 'lucide-react'
import './ReportPage.css'

function getRatingColor(score) {
  if (score >= 0.75) return 'var(--accent-green)'
  if (score >= 0.5) return 'var(--accent-orange)'
  return 'var(--accent-red)'
}

function getRatingLabel(score) {
  if (score >= 0.85) return 'Excellent'
  if (score >= 0.70) return 'Good'
  if (score >= 0.55) return 'Average'
  if (score >= 0.40) return 'Below Average'
  return 'Needs Improvement'
}

export default function ReportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedQ, setExpandedQ] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [saved, setSaved] = useState(false)
  const reportRef = useRef(null)
  const hasSavedRef = useRef(false)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      const res = await getInterviewSummary()
      if (res.data.success) {
        setReport(res.data.final_report)
        autoSaveReport(res.data.final_report, res.data.resume_filename, res.data.interview_type)
      } else {
        setError('Failed to load report')
      }
    } catch {
      setError('Could not fetch report. Make sure you completed an interview.')
    } finally {
      setLoading(false)
    }
  }

  const autoSaveReport = async (r, filename, type) => {
    if (hasSavedRef.current) return
    hasSavedRef.current = true
    try {
      await saveReport({
        interview_type: type || 'audio',
        overall_score: r.interview_performance.overall_score,
        rating: r.interview_performance.rating,
        total_questions: r.interview_performance.questions_asked,
        resume_name: filename || '',
        skills: r.candidate_profile?.identified_skills || [],
        recommendations: r.recommendations || [],
        detailed_analysis: r.detailed_analysis || []
      })
      setSaved(true)
    } catch { /* silent */ }
  }

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const el = reportRef.current
      el.classList.add('pdf-export-mode')
      
      // Give browser a tiny moment to reflow
      await new Promise(r => setTimeout(r, 100))

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      })
      
      el.classList.remove('pdf-export-mode')
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      const pageH = pdf.internal.pageSize.getHeight()

      let position = 0
      let remaining = pdfH

      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH)
        remaining -= pageH
        if (remaining > 0) {
          position -= pageH
          pdf.addPage()
        }
      }

      pdf.save(`ResumeAI_Report_${user?.name?.replace(/\s/g, '_') || 'Interview'}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return (
    <div className="report-page page-wrapper">
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p>Generating your report...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="report-page page-wrapper">
      <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--accent-red)" />
        <h2 style={{ margin: '16px 0' }}>Report Not Available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          <Home size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  )

  const perf = report?.interview_performance
  const overallScore = perf?.overall_score || 0
  const pct = Math.round(overallScore * 100)

  return (
    <div className="report-page page-wrapper">
      <div className="report-bg" />
      <div className="container">
        {/* Actions bar */}
        <div className="report-actions-bar animate-fade-up">
          <div>
            <h1>Interview Report</h1>
            {saved && <span className="badge badge-green" style={{ marginTop: '8px' }}>✓ Saved to profile</span>}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              <RefreshCw size={16} /> New Interview
            </button>
            <button className="btn btn-primary" onClick={downloadPDF} disabled={downloading}>
              {downloading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating PDF...</>
                : <><Download size={16} /> Download PDF</>}
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div ref={reportRef} className="report-content">
          {/* Score Hero */}
          <div className="score-hero glass-card animate-fade-up">
            <div className="score-hero-left">
              <div className="score-circle-lg" style={{ '--pct': `${pct * 3.6}deg`, borderColor: getRatingColor(overallScore) }}>
                <span className="score-big">{pct}%</span>
                <span className="score-sub">Overall</span>
              </div>
            </div>
            <div className="score-hero-right">
              <div className="score-verdict" style={{ color: getRatingColor(overallScore) }}>
                {getRatingLabel(overallScore)}
              </div>
              <h2 style={{ marginBottom: '16px' }}>{report?.candidate_profile?.name || user?.name}</h2>
              <div className="score-breakdown">
                {[
                  { label: 'Content Score', value: perf?.content_average || 0 },
                  { label: 'Audio Confidence', value: perf?.audio_average || 0 },
                  { label: 'Video Confidence', value: perf?.video_average || 0 },
                  { label: 'Questions Asked', value: null, raw: perf?.questions_asked || 0 },
                  { label: 'Duration', value: null, raw: `${Math.round(perf?.interview_duration_minutes || 0)} min` },
                ].map(item => (
                  <div key={item.label} className="score-breakdown-item">
                    <span className="score-breakdown-label">{item.label}</span>
                    <span className="score-breakdown-value">
                      {item.value !== null ? `${Math.round(item.value * 100)}%` : item.raw}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          {report?.candidate_profile?.identified_skills?.length > 0 && (
            <div className="glass-card p-32 animate-fade-up" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star size={20} color="var(--accent-purple)" /> Skills Identified
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {report.candidate_profile.identified_skills.map(s => (
                  <span key={s} className="badge badge-purple">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Score Chart */}
          {report?.detailed_analysis?.length > 0 && (
            <div className="glass-card p-32 animate-fade-up" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} color="var(--accent-blue)" /> Question Scores
              </h3>
              <div className="chart-bars">
                {report.detailed_analysis.map((q, i) => {
                  const s = q.composite_score || 0
                  return (
                    <div key={i} className="chart-bar-item">
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill" style={{ height: `${s * 100}%`, backgroundColor: getRatingColor(s) }} />
                      </div>
                      <span className="chart-bar-label">Q{i + 1}</span>
                      <span className="chart-bar-val">{Math.round(s * 100)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Detailed Q&A */}
          {report?.detailed_analysis?.length > 0 && (
            <div className="glass-card p-32 animate-fade-up" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>Detailed Analysis</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {report.detailed_analysis.map((item, i) => (
                  <div key={i} className={`qa-item glass-card ${expandedQ === i ? 'expanded' : ''}`}>
                    <div className="qa-header" onClick={() => setExpandedQ(expandedQ === i ? null : i)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span className="qa-num">Q{i + 1}</span>
                        <span className="qa-question">{item.question}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge ${item.composite_score >= 0.6 ? 'badge-green' : item.composite_score >= 0.4 ? 'badge-orange' : 'badge-red'}`}>
                          {Math.round((item.composite_score || 0) * 100)}%
                        </span>
                        {expandedQ === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                    {expandedQ === i && (
                      <div className="qa-details">
                        <div className="qa-scores">
                          <div className="qa-score-row">
                            <span>Content Score</span>
                            <div className="qa-score-bar">
                              <div style={{ width: `${(item.content_score?.total_score || 0) * 100}%`, height: '6px', background: getRatingColor(item.content_score?.total_score || 0), borderRadius: '3px' }} />
                            </div>
                            <span>{Math.round((item.content_score?.total_score || 0) * 100)}%</span>
                          </div>
                        </div>
                        {item.user_answer && (
                          <div className="qa-answer">
                            <strong>Your Answer:</strong>
                            <p>{item.user_answer}</p>
                          </div>
                        )}
                        {item.content_score?.keywords_found?.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Keywords detected: </span>
                            {item.content_score.keywords_found.map(k => (
                              <span key={k} className="badge badge-green" style={{ marginLeft: '4px', marginTop: '4px' }}>{k}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report?.recommendations?.length > 0 && (
            <div className="glass-card p-32 animate-fade-up" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={20} color="var(--accent-orange)" /> Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {report.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '14px 16px', background: 'rgba(245,158,11,0.06)',
                    borderRadius: '10px', border: '1px solid rgba(245,158,11,0.15)'
                  }}>
                    <CheckCircle size={16} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
