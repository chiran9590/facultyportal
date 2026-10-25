import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRealtimeTable } from './useRealtimeTable'
import type { Activity, Department, Profile } from '../types/database'

/** Activities visible to the current user (RLS decides: own / department / all). Live-updating. */
export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('activities').select('*').order('created_at', { ascending: false })
    setActivities(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])
  useRealtimeTable('activities', load)

  return { activities, loading, reload: load }
}

/** Profiles visible to the current user. Live-updating. */
export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    setProfiles(data ?? [])
  }, [])

  useEffect(() => {
    void load()
  }, [load])
  useRealtimeTable('profiles', load)

  return { profiles, reload: load }
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase.from('departments').select('*').order('name')
    setDepartments(data ?? [])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { departments, reload: load }
}
