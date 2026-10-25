import type { UserRole } from '../types/database'

export const HOME: Record<UserRole, string> = { faculty: '/faculty', hod: '/hod', admin: '/admin' }
