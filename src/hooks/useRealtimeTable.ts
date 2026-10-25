import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

/** Calls onChange whenever a row in `table` is inserted, updated or deleted (RLS still applies). */
export function useRealtimeTable(table: 'activities' | 'profiles' | 'departments', onChange: () => void) {
  const handler = useRef(onChange)
  handler.current = onChange

  useEffect(() => {
    const channel = supabase
      .channel(`rt-${table}-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => handler.current())
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [table])
}
