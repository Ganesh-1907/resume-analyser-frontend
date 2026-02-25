import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
})

// Attach auth token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const register = (data) => api.post('/register', data)
export const login = (data) => api.post('/login', data)
export const getProfile = () => api.get('/profile')
export const updateProfile = (data) => api.put('/profile', data)
export const saveReport = (data) => api.post('/save-report', data)

// Resume
export const uploadResume = (formData) =>
  api.post('/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// Interview
export const startInterview = (interviewType) => api.post('/start-interview', { interview_type: interviewType })
export const getNextQuestion = () => api.get('/get-next-question')
export const submitAnswer = (formData) =>
  api.post('/submit-answer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getInterviewSummary = () => api.get('/get-interview-summary')

export default api
