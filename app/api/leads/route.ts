import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('leads')
    .insert({
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      property_address: body.property_address,
      source: body.source,
      notes: body.notes,
      estimated_value: body.estimated_value,
      status: body.status || 'new',
      tenant_id: body.tenant_id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
