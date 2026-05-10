import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CallbackPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    new URL(typeof window !== 'undefined' ? window.location.href : '').searchParams.get('code') || ''
  )

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (data.user) {
    redirect('/')
  }

  redirect('/auth/login')
}
