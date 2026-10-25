import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useActivities } from '../hooks/useData'
import StatusBadge from '../components/StatusBadge'
import Stats from '../components/Stats'
import { ACTIVITY_LABELS, type ActivityType } from '../types/database'

const today = () => new Date().toISOString().slice(0, 10)

export default function FacultyDashboard() {
  const { profile } = useAuth()
  const { activities, loading, reload } = useActivities()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ActivityType>('fdp')
  const [organizer, setOrganizer] = useState('')
  const [startDate, setStartDate] = useState(today())
  const [endDate, setEndDate] = useState(today())
  const [hours, setHours] = useState(10)
  const [certUrl, setCertUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.from('activities').insert({
      faculty_id: profile.id,
      title: title.trim(),
      type,
      organizer: organizer.trim(),
      start_date: startDate,
      end_date: endDate,
      hours,
      certificate_url: certUrl.trim() || null,
    })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setTitle('')
    setOrganizer('')
    setCertUrl('')
    void reload()
  }

  async function remove(id: string) {
    await supabase.from('activities').delete().eq('id', id)
    void reload()
  }

  return (
    <>
      <h1>My development record</h1>
      <Stats activities={activities} />

      <section className="panel">
        <h2>Add an activity</h2>
        <form className="form grid" onSubmit={submit}>
          <label className="span-2">Title
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Machine learning for educators" />
          </label>
          <label>Type
            <select value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
              {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((t) => <option key={t} value={t}>{ACTIVITY_LABELS[t]}</option>)}
            </select>
          </label>
          <label>Organised by
            <input required value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
          </label>
          <label>Start date
            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>End date
            <input type="date" required min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <label>Hours
            <input type="number" min={1} required value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </label>
          <label>Certificate link (optional)
            <input type="url" value={certUrl} onChange={(e) => setCertUrl(e.target.value)} placeholder="https://" />
          </label>
          {error && <p className="error span-2" role="alert">{error}</p>}
          <div className="span-2"><button className="btn btn-primary" disabled={busy}>Submit for review</button></div>
        </form>
      </section>

      <section className="panel">
        <h2>My activities</h2>
        {loading ? <p className="muted">Loading…</p> : activities.length === 0 ? (
          <p className="muted">Nothing recorded yet. Add your first activity above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Type</th><th>Dates</th><th>Hours</th><th>Status</th><th>HoD note</th><th /></tr></thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td>{a.certificate_url ? <a href={a.certificate_url} target="_blank" rel="noreferrer">{a.title}</a> : a.title}<div className="muted small">{a.organizer}</div></td>
                    <td>{ACTIVITY_LABELS[a.type]}</td>
                    <td>{a.start_date} to {a.end_date}</td>
                    <td>{a.hours}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{a.review_note ?? ''}</td>
                    <td>{a.status === 'pending' && <button className="btn btn-quiet" onClick={() => void remove(a.id)}>Withdraw</button>}</td>
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
