import type { Activity } from '../types/database'

export default function Stats({ activities }: { activities: Activity[] }) {
  const approved = activities.filter((a) => a.status === 'approved')
  const hours = approved.reduce((sum, a) => sum + a.hours, 0)
  const pending = activities.filter((a) => a.status === 'pending').length
  const rejected = activities.filter((a) => a.status === 'rejected').length
  return (
    <dl className="stats">
      <div><dt>Approved hours</dt><dd>{hours}</dd></div>
      <div><dt>Approved activities</dt><dd>{approved.length}</dd></div>
      <div><dt>Awaiting review</dt><dd>{pending}</dd></div>
      <div><dt>Rejected</dt><dd>{rejected}</dd></div>
    </dl>
  )
}
