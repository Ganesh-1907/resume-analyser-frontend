import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNextQuestion, submitAnswer } from '../api/api'
import { Video, VideoOff, Square, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'
import './InterviewPage.css'

export default function VideoInterviewPage() {
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
  const [videoBlob, setVideoBlob] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [manualAnswer, setManualAnswer] = useState('')
  const [useText, setUseText] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [loadingQ, setLoadingQ] = useState(true)
  const [cameraReady, setCameraReady] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const videoRef = useRef(null)
  const previewRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      fetchQuestion()
      initCamera()
    }
    return () => {
      clearInterval(timerRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraReady(true)
    } catch {
      setError('Camera access denied. Use text input to answer.')
      setUseText(true)
    }
  }

  const fetchQuestion = async () => {
    setLoadingQ(true)
    setError('')
    setVideoBlob(null)
    setVideoUrl(null)
    setManualAnswer('')
    try {
      const res = await getNextQuestion()
      if (res.data.success) {
        setQuestion(res.data)
        setQuestionNum(res.data.question_number)
        setTotal(res.data.total_questions)
        setTimeLeft(120)
        startTimer()
      } else if (res.data.interview_complete) {
        navigate('/report')
      }
    } catch {
      setError('Failed to fetch question.')
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setRecording(false)
      setTimeout(submitCurrentAnswer, 500)
    } else {
      submitCurrentAnswer()
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return
    chunksRef.current = []
    const mr = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' })
    mr.ondataavailable = e => chunksRef.current.push(e.data)
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setVideoBlob(blob)
      setVideoUrl(URL.createObjectURL(blob))
    }
    mr.start()
    mediaRecorderRef.current = mr
    setRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const submitCurrentAnswer = async () => {
    console.log('Final blobs:', { videoBlob, manualAnswer })
    if (!videoBlob && !manualAnswer.trim()) {
      if (!question) return
    }
    setProcessing(true)
    clearInterval(timerRef.current)
    try {
      const fd = new FormData()
      fd.append('question_id', question.question_id)
      if (videoBlob) {
        fd.append('video_file', videoBlob, 'answer.webm')
      } else {
        fd.append('answer', manualAnswer.trim())
      }
      const res = await submitAnswer(fd)
      if (res.data.success) {
        const eval_ = res.data.evaluation
        setResults(prev => [...prev, {
          question: question.question,
          score: eval_.composite_score,
          transcription: res.data.transcription
        }])
        const next = await getNextQuestion()
        if (next.data.success) {
          setQuestion(next.data)
          setQuestionNum(next.data.question_number)
          setVideoBlob(null)
          setVideoUrl(null)
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

  if (loadingQ && !question) return (
    <div className="interview-page page-wrapper">
      <div className="loading-overlay"><div className="spinner" style={{ width: 48, height: 48 }} /><p>Loading...</p></div>
    </div>
  )

  return (
    <div className="interview-page page-wrapper">
      <div className="interview-bg video-bg" />
      <div className="container">
        <div className="interview-header animate-fade-up">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Video size={20} color="var(--accent-cyan)" />
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Video Interview</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Question {questionNum} of {total}
            </p>
          </div>
          <div className="progress-section">
            <div className="progress-bar" style={{ width: '200px' }}>
              <div className="progress-fill" style={{ width: `${(questionNum / total) * 100}%`, background: 'var(--accent-cyan)' }} />
            </div>
            <span className={`timer ${timeLeft <= 30 ? 'timer-warning' : ''}`}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        {error && <div className="alert alert-error mb-16"><AlertCircle size={16} />{error}</div>}

        <div className="video-interview-layout">
          <div className="question-card glass-card animate-fade-up">
            <div className="question-meta">
              {question && <><span className="badge badge-blue">{question.category}</span>
              <span className={`badge ${question.difficulty === 'hard' ? 'badge-red' : question.difficulty === 'easy' ? 'badge-green' : 'badge-orange'}`}>{question.difficulty}</span></>}
            </div>
            {question && <h2 className="question-text">{question.question}</h2>}

            {!useText ? (
              <div className="recording-section">
                <div className="recorder-controls">
                  {!recording && !videoBlob && cameraReady && (
                    <button className="btn record-btn video-record-btn" onClick={startRecording}>
                      <Video size={20} /> Start Recording
                    </button>
                  )}
                  {recording && (
                    <button className="btn record-btn recording-active" onClick={stopRecording}>
                      <div className="rec-dot" /> Recording... Click to Stop
                    </button>
                  )}
                  {videoBlob && !recording && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <CheckCircle size={20} color="var(--accent-green)" />
                      <span>Video captured!</span>
                      <video src={videoUrl} controls style={{ maxHeight: '120px', borderRadius: '8px' }} />
                      <button className="btn btn-secondary btn-sm" onClick={() => { setVideoBlob(null); setVideoUrl(null) }}>Re-record</button>
                    </div>
                  )}
                </div>
                <button className="toggle-text-btn" onClick={() => setUseText(true)}>Can't use camera? Type your answer</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea className="form-input" rows={4} placeholder="Type your answer..."
                  value={manualAnswer} onChange={e => setManualAnswer(e.target.value)} style={{ resize: 'vertical' }} />
                <button className="toggle-text-btn" onClick={() => setUseText(false)}>Switch back to video</button>
              </div>
            )}

            <div className="question-actions">
              <button className="btn btn-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: 'white' }}
                onClick={submitCurrentAnswer} disabled={processing || (!videoBlob && !manualAnswer.trim())}>
                {processing ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Evaluating...</>
                  : <>Next Question <ChevronRight size={18} /></>}
              </button>
            </div>
          </div>

          {/* Live camera preview */}
          <div className="camera-preview-panel">
            <div className="camera-preview glass-card">
              {cameraReady ? (
                <>
                  <video ref={videoRef} muted style={{ width: '100%', borderRadius: '12px', background: '#000' }} />
                  {recording && <div className="recording-indicator"><div className="rec-dot" /> REC</div>}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px', color: 'var(--text-secondary)' }}>
                  <VideoOff size={40} />
                  <p>Camera not available</p>
                </div>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '8px' }}>Your live preview</p>
          </div>
        </div>

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
