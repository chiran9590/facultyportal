import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StatusBadge from './StatusBadge'
import { ACTIVITY_LABELS, type Activity, type ActivityStatus, type Department, type Profile } from '../types/database'

type Filter = 'pending' | 'approved' | 'rejected' | 'all'

type Props = {
  activities: Activity[]
  profiles: Profile[]
  departments: Department[]
  onChanged: () => void
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'pending', label: 'Awaiting review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
]

export default function ReviewQueue({ activities, profiles, departments, onChanged }: Props) {
  const { profile } = useAuth()
  const [filter, setFilter] = useState<Filter>('pending')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const people = useMemo(() => new Map(profiles.map((p) => [p.id, p.full_name || p.email])), [profiles])
  const depts = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments])
  const counts = useMemo(
    () => ({
      pending: activities.filter((a) => a.status === 'pending').length,
      approved: activities.filter((a) => a.status === 'approved').length,
      rejected: activities.filter((a) => a.status === 'rejected').length,
      all: activities.length,
    }),
    [activities],
  )
  const shown = activities.filter((a) => filter === 'all' || a.status === filter)

  async function decide(id: string, status: Extract<ActivityStatus, 'approved' | 'rejected'>) {
    if (!profile) return
    const note = notes[id]?.trim() ?? ''
    if (status === 'rejected' && !note) {
      setError('Add a short reason before rejecting, so the faculty member knows what to fix.')
      return
    }
    setError(null)
    setBusyId(id)
    const { error: err } = await supabase
      .from('activities')
      .update({
        status,
        review_note: note || null,
        reviewer_id: profile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
    setBusyId(null)
    if (err) setError(err.message)
    else onChanged()
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Faculty approvals</h2>
        <div className="seg" role="group" aria-label="Filter approvals">
          {FILTERS.map((f) => (
            <button key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {shown.length === 0 ? (
        <p className="muted">{filter === 'pending' ? 'No submissions are waiting for review.' : 'Nothing to show here.'}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Faculty</th><th>Activity</th><th>Hours</th><th>Status</th><th>Decision</th></tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td>
                    {people.get(a.faculty_id) ?? 'Unknown'}
                    <div className="muted small">{a.department_id ? depts.get(a.department_id) ?? '' : 'No department'}</div>
                  </td>
                  <td>
                    {a.certificate_url ? <a href={a.certificate_url} target="_blank" rel="noreferrer">{a.title}</a> : a.title}
                    <div className="muted small">{ACTIVITY_LABELS[a.type]}, {a.start_date} to {a.end_date}</div>
                  </td>
                  <td>{a.hours}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status === 'pending' ? (
                      <div className="decision">
                        <input
                          placeholder="Note (required to reject)"
                          value={notes[a.id] ?? ''}
                          onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                        />
                        <button className="btn btn-primary" disabled={busyId === a.id} onClick={() => void decide(a.id, 'approved')}>Approve</button>
                        <button className="btn btn-danger" disabled={busyId === a.id} onClick={() => void decide(a.id, 'rejected')}>Reject</button>
                      </div>
                    ) : (
                      <div>
                        {a.review_note ?? ''}
                        <div className="muted small">
                          {a.reviewer_id ? `By ${people.get(a.reviewer_id) ?? 'a reviewer'}` : ''}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
