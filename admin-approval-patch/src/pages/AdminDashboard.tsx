import { useMemo, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useActivities, useDepartments, useProfiles } from '../hooks/useData'
import Stats from '../components/Stats'
import ReviewQueue from '../components/ReviewQueue'
import { ROLE_LABELS, type UserRole } from '../types/database'

export default function AdminDashboard() {
  const { activities, reload: reloadActivities } = useActivities()
  const { profiles, reload: reloadProfiles } = useProfiles()
  const { departments, reload: reloadDepartments } = useDepartments()
  const [newDept, setNewDept] = useState('')
  const [error, setError] = useState<string | null>(null)

  const hoursByDept = useMemo(() => {
    const totals = new Map<string, number>()
    for (const a of activities) {
      if (a.status !== 'approved' || !a.department_id) continue
      totals.set(a.department_id, (totals.get(a.department_id) ?? 0) + a.hours)
    }
    return totals
  }, [activities])

  async function addDepartment(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const { error: err } = await supabase.from('departments').insert({ name: newDept.trim() })
    if (err) setError(err.message)
    else {
      setNewDept('')
      void reloadDepartments()
    }
  }

  async function updateUser(id: string, patch: { role?: UserRole; department_id?: string | null }) {
    setError(null)
    const { error: err } = await supabase.from('profiles').update(patch).eq('id', id)
    if (err) setError(err.message)
    else void reloadProfiles()
  }

  return (
    <>
      <h1>Administration</h1>
      <Stats activities={activities} />
      {error && <p className="error" role="alert">{error}</p>}

      <ReviewQueue
        activities={activities}
        profiles={profiles}
        departments={departments}
        onChanged={() => void reloadActivities()}
      />

      <section className="panel">
        <h2>Departments</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Department</th><th>Approved hours</th></tr></thead>
            <tbody>
              {departments.map((d) => <tr key={d.id}><td>{d.name}</td><td>{hoursByDept.get(d.id) ?? 0}</td></tr>)}
            </tbody>
          </table>
        </div>
        <form className="inline-form" onSubmit={addDepartment}>
          <input required placeholder="New department name" value={newDept} onChange={(e) => setNewDept(e.target.value)} />
          <button className="btn btn-primary">Add department</button>
        </form>
      </section>

      <section className="panel">
        <h2>People</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th></tr></thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name || 'No name'}</td>
                  <td>{p.email}</td>
                  <td>
                    <select value={p.role} onChange={(e) => void updateUser(p.id, { role: e.target.value as UserRole })}>
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={p.department_id ?? ''} onChange={(e) => void updateUser(p.id, { department_id: e.target.value || null })}>
                      <option value="">None</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
