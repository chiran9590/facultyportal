import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HOME } from '../lib/routes'
import type { UserRole } from '../types/database'


export default function ProtectedRoute({ allow, children }: { allow: UserRole[]; children: ReactNode }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <p className="center-note">Loading…</p>
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <p className="center-note">Setting up your profile…</p>
  if (!allow.includes(profile.role)) return <Navigate to={HOME[profile.role]} replace />
  return <>{children}</>
}
