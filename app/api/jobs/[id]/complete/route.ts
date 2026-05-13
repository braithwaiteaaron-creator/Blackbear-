import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { final_amount, notes } = await request.json()

    if (!final_amount && final_amount !== 0) {
      return NextResponse.json({ error: 'final_amount is required' }, { status: 400 })
    }

    const amount = parseFloat(final_amount)

    const { error: jobError } = await supabase
      .from('jobs')
      .update({
        status: 'completed',
        paid: true,
        actual_amount: amount,
        notes: notes || '',
        time_ended_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    const { error: allocError } = await supabase
      .from('payment_allocations')
      .insert({
        job_id: id,
        labour_cost: amount * 0.45,
        material_cost: amount * 0.20,
        overhead_cost: amount * 0.15,
        tax_cost: amount * 0.13,
        profit: amount * 0.07,
      })

    if (allocError) {
      return NextResponse.json({ error: allocError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
