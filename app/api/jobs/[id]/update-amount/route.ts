import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { actual_amount } = await request.json()

  const supabase = createClient()

  const { error } = await supabase
    .from('jobs')
    .update({ actual_amount })
    .eq('id', id)

  if (error) {
    console.error('[api] Error updating job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
