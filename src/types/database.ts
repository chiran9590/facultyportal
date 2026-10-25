export type UserRole = 'faculty' | 'hod' | 'admin'
export type ActivityType = 'fdp' | 'workshop' | 'conference' | 'certification' | 'publication'
export type ActivityStatus = 'pending' | 'approved' | 'rejected'

export type Department = {
  id: string
  name: string
  created_at: string
}

export type Profile = {
  id: string
  full_name: string
  email: string
  role: UserRole
  department_id: string | null
  created_at: string
}

export type Activity = {
  id: string
  faculty_id: string
  department_id: string | null
  title: string
  type: ActivityType
  organizer: string
  start_date: string
  end_date: string
  hours: number
  certificate_url: string | null
  status: ActivityStatus
  reviewer_id: string | null
  review_note: string | null
  reviewed_at: string | null
  created_at: string
}

export type ActivityInsert = {
  faculty_id: string
  title: string
  type: ActivityType
  organizer: string
  start_date: string
  end_date: string
  hours: number
  certificate_url?: string | null
}

export type Database = {
  public: {
    Tables: {
      departments: {
        Row: Department
        Insert: { id?: string; name: string; created_at?: string }
        Update: { name?: string }
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: {
          id: string
          full_name?: string
          email?: string
          role?: UserRole
          department_id?: string | null
        }
        Update: {
          full_name?: string
          role?: UserRole
          department_id?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: Activity
        Insert: ActivityInsert
        Update: {
          title?: string
          type?: ActivityType
          organizer?: string
          start_date?: string
          end_date?: string
          hours?: number
          certificate_url?: string | null
          status?: ActivityStatus
          reviewer_id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      user_role: UserRole
      activity_type: ActivityType
      activity_status: ActivityStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  fdp: 'Faculty development programme',
  workshop: 'Workshop',
  conference: 'Conference',
  certification: 'Certification',
  publication: 'Publication',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  faculty: 'Faculty',
  hod: 'Head of Department',
  admin: 'Admin',
}
