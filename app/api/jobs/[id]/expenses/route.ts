import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const body = await request.json()

    // Delete existing expenses for this job
    await supabase.from('job_expenses').delete().eq('job_id', id)

    // Insert new expense record
    const { error } = await supabase.from('job_expenses').insert({
      job_id: id,
      labor_type: body.labor_type,
      hourly_rate: body.hourly_rate,
      hours_worked: body.hours_worked,
      flat_labor_amount: body.flat_labor_amount,
      dump_fees: body.dump_fees,
      gas: body.gas,
      equipment: body.equipment,
      truck_fund: body.truck_fund,
      insurance: body.insurance,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving expenses:', error)
    return NextResponse.json(
      { error: 'Failed to save expenses' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('job_expenses')
      .select('*')
      .eq('job_id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error // 404 is OK

    return NextResponse.json(data || {})
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}
