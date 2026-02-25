import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNextQuestion, submitAnswer } from '../api/api'
import { Mic, MicOff, Square, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'
import './InterviewPage.css'

export default function AudioInterviewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { totalQuestions = 10 } = location.state || {}

  const [question, setQuestion] = useState(null)
  const [questionNum, setQuestionNum] = useState(0)
  const [total, setTotal] = useState(totalQuestions)
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)
  const [manualAnswer, setManualAnswer] = useState('')
  const [useText, setUseText] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [loadingQ, setLoadingQ] = useState(true)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      fetchQuestion()
    }
    return () => clearInterval(timerRef.current)
  }, [])

  const fetchQuestion = async () => {
    setLoadingQ(true)
    setError('')
    setAudioBlob(null)
    setAudioUrl(null)
    setManualAnswer('')
    try {
      const res = await getNextQuestion()
      if (res.data.success) {
        setQuestion(res.data)
        setQuestionNum(res.data.question_number)
        setTotal(res.data.total_questions)
        setTimeLeft(120) // 2 min per question
        startTimer()
      } else if (res.data.interview_complete) {
        navigate('/report')
      }
    } catch {
      setError('Failed to fetch question. Check backend connection.')
    } finally {
      setLoadingQ(false)
    }
  }

  const startTimer = () => {
    clearInterval(timerRef.current)
    let t = 120
    timerRef.current = setInterval(() => {
      t--
      setTimeLeft(t)
      if (t <= 0) {
        clearInterval(timerRef.current)
        autoSubmit()
      }
    }, 1000)
  }

  const autoSubmit = async () => {
    // If still recording, stop it first
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setRecording(false)
      // Wait a bit for the onstop handler to create the blob
      setTimeout(submitCurrentAnswer, 500)
    } else {
      submitCurrentAnswer()
    }
  }

  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
    } catch {
      setError('Microphone access denied. Please allow microphone access or type your answer below.')
      setUseText(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const submitCurrentAnswer = async () => {
    console.log('Final blobs:', { audioBlob, manualAnswer })
    if (!audioBlob && !manualAnswer.trim()) {
      if (!question) return
    }
    setProcessing(true)
    setError('')
    clearInterval(timerRef.current)
    try {
      const fd = new FormData()
      fd.append('question_id', question.question_id)
      if (audioBlob) {
        fd.append('audio_file', audioBlob, 'answer.webm')
      } else {
        fd.append('answer', manualAnswer.trim())
      }
      const res = await submitAnswer(fd)
      if (res.data.success) {
        const eval_ = res.data.evaluation
        setResults(prev => [...prev, {
          question: question.question,
          category: question.category,
          score: eval_.composite_score,
          contentScore: eval_.content_evaluation?.total_score,
          transcription: res.data.transcription
        }])
        // fetch next
        const next = await getNextQuestion()
        if (next.data.success) {
          setQuestion(next.data)
          setQuestionNum(next.data.question_number)
          setTotal(next.data.total_questions)
          setAudioBlob(null)
          setAudioUrl(null)
          setManualAnswer('')
          setTimeLeft(120)
          startTimer()
        } else {
          navigate('/report')
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed')
    } finally {
      setProcessing(false)
    }
  }

  const finishInterview = () => navigate('/report')

  if (loadingQ && !question) return (
    <div className="interview-page page-wrapper">
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p>Loading your question...</p>
      </div>
    </div>
  )

  return (
    <div className="interview-page page-wrapper">
      <div className="interview-bg" />
      <div className="container">
        <div className="interview-header animate-fade-up">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Mic size={20} color="var(--accent-purple)" />
              <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Audio Interview</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Question {questionNum} of {total}
            </p>
          </div>
          <div className="progress-section">
            <div className="progress-bar" style={{ width: '200px' }}>
              <div className="progress-fill" style={{ width: `${(questionNum / total) * 100}%` }} />
            </div>
            {timeLeft !== null && (
              <span className={`timer ${timeLeft <= 30 ? 'timer-warning' : ''}`}>
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error mb-16"><AlertCircle size={16} />{error}</div>}

        {question && (
          <div className="question-card glass-card animate-fade-up">
            <div className="question-meta">
              <span className="badge badge-purple">{question.category}</span>
              <span className={`badge ${question.difficulty === 'hard' ? 'badge-red' : question.difficulty === 'easy' ? 'badge-green' : 'badge-orange'}`}>
                {question.difficulty}
              </span>
            </div>
            <h2 className="question-text">{question.question}</h2>

            {/* Recording Controls */}
            <div className="recording-section">
              {!useText ? (
                <>
                  <div className="recorder-controls">
                    {!recording && !audioBlob && (
                      <button className="btn btn-primary record-btn" onClick={startRecording}>
                        <Mic size={20} /> Start Recording
                      </button>
                    )}
                    {recording && (
                      <button className="btn record-btn recording-active" onClick={stopRecording}>
                        <div className="rec-dot" /> Recording... Click to Stop
                      </button>
                    )}
                    {audioBlob && !recording && (
                      <div className="audio-preview">
                        <CheckCircle size={20} color="var(--accent-green)" />
                        <span>Recording captured!</span>
                        <audio src={audioUrl} controls style={{ flex: 1, minWidth: 0 }} />
                        <button className="btn btn-secondary btn-sm" onClick={() => { setAudioBlob(null); setAudioUrl(null) }}>
                          Re-record
                        </button>
                      </div>
                    )}
                  </div>
                  <button className="toggle-text-btn" onClick={() => setUseText(!useText)}>
                    Can't use mic? Type your answer
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Type your answer here..."
                    value={manualAnswer}
                    onChange={e => setManualAnswer(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                  <button className="toggle-text-btn" onClick={() => setUseText(false)}>
                    Switch to voice recording
                  </button>
                </div>
              )}
            </div>

            <div className="question-actions">
              <button className="btn btn-primary btn-lg" onClick={submitCurrentAnswer}
                disabled={processing || (!audioBlob && !manualAnswer.trim())}>
                {processing ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Evaluating...</>
                  : <>Next Question <ChevronRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Mini results */}
        {results.length > 0 && (
          <div className="mini-results animate-fade-up">
            <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>Answered Questions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map((r, i) => (
                <div key={i} className="mini-result-item glass-card">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Q{i + 1}: {r.question.slice(0, 60)}...</span>
                  <span className={`badge ${r.score >= 0.6 ? 'badge-green' : r.score >= 0.4 ? 'badge-orange' : 'badge-red'}`}>
                    {(r.score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
