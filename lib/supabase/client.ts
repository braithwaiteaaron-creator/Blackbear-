import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nxnghkajgixjzsknhkfg.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bmdoa2FqZ2l4anpza25oa2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTE1MjMsImV4cCI6MjA5MDIyNzUyM30.DNG8YfnwgsvVqTWRpkWaE75OfaODcPtb4jkFLYUZhAI'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
