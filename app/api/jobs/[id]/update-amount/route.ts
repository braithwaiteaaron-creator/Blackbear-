import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[api/update-amount] Starting PATCH request')
    const { id } = await params
    console.log('[api/update-amount] Job ID:', id)
    
    const body = await request.json()
    console.log('[api/update-amount] Request body:', body)
    const { actual_amount } = body

    if (!actual_amount) {
      return NextResponse.json({ error: 'actual_amount is required' }, { status: 400 })
    }

    const supabase = await createClient()
    console.log('[api/update-amount] Supabase client created')

    const { data, error } = await supabase
      .from('jobs')
      .update({ actual_amount: parseFloat(actual_amount) })
      .eq('id', id)
      .select()

    console.log('[api/update-amount] Supabase response:', { data, error })

    if (error) {
      console.error('[api/update-amount] Supabase error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[api/update-amount] Success - updated:', data)
    return NextResponse.json({ success: true, data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[api/update-amount] Exception:', msg, e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
