import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('[api/complete] Starting POST request')
    const { id } = await params
    console.log('[api/complete] Job ID:', id)

    const supabase = await createClient()
    const { final_amount, notes } = await request.json()
    console.log('[api/complete] final_amount:', final_amount)

    if (!final_amount) {
      return NextResponse.json({ error: 'final_amount is required' }, { status: 400 })
    }

    const amount = parseFloat(final_amount)
    console.log('[api/complete] Updating job status to completed...')

    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .update({
        status: 'completed',
        paid: true,
        actual_amount: amount,
        notes: notes || '',
        time_ended_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    console.log('[api/complete] Job update response:', { jobData, error: jobError })
    if (jobError) {
      console.error('[api/complete] Job update error:', jobError.message)
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    console.log('[api/complete] Creating payment allocation...')
    const { data: allocData, error: allocError } = await supabase
      .from('payment_allocations')
      .insert({
        job_id: id,
        labour_cost: amount * 0.45,
        material_cost: amount * 0.20,
        overhead_cost: amount * 0.15,
        tax_cost: amount * 0.13,
        profit: amount * 0.07,
      })
      .select()

    console.log('[api/complete] Allocation response:', { allocData, error: allocError })
    if (allocError) {
      console.error('[api/complete] Allocation error:', allocError.message)
      return NextResponse.json({ error: allocError.message }, { status: 500 })
    }

    console.log('[api/complete] Success')
    return NextResponse.json({ success: true, job: jobData, allocation: allocData })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[api/complete] Exception:', msg, e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
