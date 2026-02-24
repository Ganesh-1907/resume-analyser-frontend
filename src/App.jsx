import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import AudioInterviewPage from './pages/AudioInterviewPage'
import VideoInterviewPage from './pages/VideoInterviewPage'
import ReportPage from './pages/ReportPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="loading-overlay" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
    </div>
  )
  return user ? children : <Navigate to="/signin" replace />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<GuestRoute><SignInPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/interview/audio" element={<ProtectedRoute><AudioInterviewPage /></ProtectedRoute>} />
        <Route path="/interview/video" element={<ProtectedRoute><VideoInterviewPage /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
