import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import TemplatesPage from './pages/TemplatesPage'
import ProfilePage from './pages/ProfilePage'
import JobMatchPage from './pages/JobMatchPage'
import AdminPage from './pages/AdminPage'
import Layout from './components/layout/Layout'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  const isAdmin = user?.role === 'Admin' || user?.email === 'admin@test.com'
  
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={
        <GuestRoute><LoginPage /></GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute><RegisterPage /></GuestRoute>
      } />

      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="job-match" element={<JobMatchPage />} />
      </Route>

      {/* Admin Panel */}
      <Route path="/admin" element={
        <AdminRoute>
          <Layout />
        </AdminRoute>
      }>
        <Route index element={<AdminPage />} />
      </Route>

      {/* Editor has its own full-screen layout */}
      <Route path="/editor/:resumeId" element={
        <ProtectedRoute><EditorPage /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
