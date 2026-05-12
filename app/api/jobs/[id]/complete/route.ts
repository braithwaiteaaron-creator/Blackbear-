import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const { final_amount, notes } = await request.json()

  const { error: jobError } = await supabase
    .from('jobs')
    .update({
      status: 'completed',
      paid: true,
      actual_amount: final_amount,
      notes,
      time_ended_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (jobError) return NextResponse.json({ error: jobError.message }, { status: 500 })

  const { error: allocError } = await supabase
    .from('payment_allocations')
    .insert({
      job_id: id,
      labour_cost: final_amount * 0.45,
      material_cost: final_amount * 0.20,
      overhead_cost: final_amount * 0.15,
      tax_cost: final_amount * 0.13,
      profit: final_amount * 0.07,
    })

  if (allocError) return NextResponse.json({ error: allocError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
