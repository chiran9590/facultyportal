# Admin approvals patch

Adds an "Faculty approvals" queue to the Admin dashboard: Approve / Reject buttons, a note field
(required when rejecting), filters (Awaiting review, Approved, Rejected, All) and live updates.

Files:
- src/components/ReviewQueue.tsx   (new)
- src/pages/AdminDashboard.tsx     (replaced)

No new packages and no SQL changes: the existing "activities admin all" policy already lets admins update activities.
