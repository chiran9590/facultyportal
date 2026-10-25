import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDepartments } from '../hooks/useData'
import { HOME } from '../lib/routes'

export default function Login() {
  const { session, profile, signIn, signUp } = useAuth()
  const { departments } = useDepartments()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session && profile) return <Navigate to={HOME[profile.role]} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    const err =
      mode === 'signin' ? await signIn(email, password) : await signUp(email, password, fullName.trim(), departmentId)
    setBusy(false)
    if (err) setError(err)
    else if (mode === 'signup') setNotice('Account created. If email confirmation is on, check your inbox, then sign in.')
  }

  return (
    <div className="login">
      <section className="login-card">
        <h1>Faculty Development Portal</h1>
        <p className="muted">Record, review and approve professional development activity.</p>

        <form onSubmit={onSubmit} className="form">
          {mode === 'signup' && (
            <>
              <label>Full name
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
              </label>
              <label>Department
                <select required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                  <option value="">Select your department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
            </>
          )}
          <label>Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label>Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="notice">{notice}</p>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button className="link" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setNotice(null) }}>
          {mode === 'signin' ? 'New faculty member? Create an account' : 'Already registered? Sign in'}
        </button>
      </section>
    </div>
  )
}
