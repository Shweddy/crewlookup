import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Crew = {
  id: string
  crew_id: string
  name: string
  position: string | null
  line_link: string
  is_registered: boolean
  is_visible: boolean
  created_at: string
}

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === 'your_supabase_project_url') {
    throw new Error('Supabase env vars not configured')
  }
  _client = createClient(url, key)
  return _client
}
