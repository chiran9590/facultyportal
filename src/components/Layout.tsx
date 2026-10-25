import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../types/database'

export default function Layout() {
  const { profile, signOut } = useAuth()
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">Faculty Development Portal</div>
        {profile && (
          <div className="who">
            <span className="who-name">{profile.full_name || profile.email}</span>
            <span className="role-tag">{ROLE_LABELS[profile.role]}</span>
            <button className="btn btn-quiet" onClick={() => void signOut()}>Sign out</button>
          </div>
        )}
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
