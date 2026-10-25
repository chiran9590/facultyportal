import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useActivities, useProfiles } from '../hooks/useData'
import StatusBadge from '../components/StatusBadge'
import Stats from '../components/Stats'
import { ACTIVITY_LABELS, type ActivityStatus } from '../types/database'

type Filter = 'pending' | 'all'

export default function HodDashboard() {
  const { profile } = useAuth()
  const { activities, loading, reload } = useActivities()
  const { profiles } = useProfiles()
  const [filter, setFilter] = useState<Filter>('pending')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const names = useMemo(() => new Map(profiles.map((p) => [p.id, p.full_name || p.email])), [profiles])
  const shown = activities.filter((a) => filter === 'all' || a.status === 'pending')

  async function review(id: string, status: Extract<ActivityStatus, 'approved' | 'rejected'>) {
    if (!profile) return
    setError(null)
    const { error: err } = await supabase
      .from('activities')
      .update({
        status,
        review_note: notes[id]?.trim() || null,
        reviewer_id: profile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (err) setError(err.message)
    else void reload()
  }

  return (
    <>
      <h1>Department review</h1>
      <Stats activities={activities} />

      <section className="panel">
        <div className="panel-head">
          <h2>Activities</h2>
          <div className="seg" role="group" aria-label="Filter">
            <button className={filter === 'pending' ? 'on' : ''} onClick={() => setFilter('pending')}>Awaiting review</button>
            <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
          </div>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {loading ? <p className="muted">Loading…</p> : shown.length === 0 ? (
          <p className="muted">{filter === 'pending' ? 'Nothing is waiting for your review.' : 'No activities in your department yet.'}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Faculty</th><th>Activity</th><th>Hours</th><th>Status</th><th>Decision</th></tr></thead>
              <tbody>
                {shown.map((a) => (
                  <tr key={a.id}>
                    <td>{names.get(a.faculty_id) ?? 'Unknown'}</td>
                    <td>
                      {a.certificate_url ? <a href={a.certificate_url} target="_blank" rel="noreferrer">{a.title}</a> : a.title}
                      <div className="muted small">{ACTIVITY_LABELS[a.type]}, {a.start_date} to {a.end_date}</div>
                    </td>
                    <td>{a.hours}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      {a.status === 'pending' ? (
                        <div className="decision">
                          <input placeholder="Note (optional)" value={notes[a.id] ?? ''} onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })} />
                          <button className="btn btn-primary" onClick={() => void review(a.id, 'approved')}>Approve</button>
                          <button className="btn btn-danger" onClick={() => void review(a.id, 'rejected')}>Reject</button>
                        </div>
                      ) : (a.review_note ?? '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
