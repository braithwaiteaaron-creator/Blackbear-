import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { actual_amount } = body

    if (!actual_amount && actual_amount !== 0) {
      return NextResponse.json({ error: 'actual_amount is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get job with quote_id
    const { data: jobData, error: fetchError } = await supabase
      .from('jobs')
      .select('quote_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('jobs')
      .update({ actual_amount: parseFloat(actual_amount) })
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If there's a linked quote, update its amount too
    if (jobData?.quote_id) {
      await supabase
        .from('quotes')
        .update({ amount: parseFloat(actual_amount) })
        .eq('id', jobData.quote_id)
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
