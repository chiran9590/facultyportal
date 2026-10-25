import type { ActivityStatus } from '../types/database'

const TEXT: Record<ActivityStatus, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }

export default function StatusBadge({ status }: { status: ActivityStatus }) {
  return <span className={`badge badge-${status}`}>{TEXT[status]}</span>
}
