import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import FacultyDashboard from './pages/FacultyDashboard'
import HodDashboard from './pages/HodDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { HOME } from './lib/routes'

function RoleRedirect() {
  const { session, profile, loading } = useAuth()
  if (loading) return <p className="center-note">Loading…</p>
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <p className="center-note">Setting up your profile…</p>
  return <Navigate to={HOME[profile.role]} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/faculty" element={<ProtectedRoute allow={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/hod" element={<ProtectedRoute allow={['hod']}><HodDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allow={['admin']}><AdminDashboard /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  )
}
