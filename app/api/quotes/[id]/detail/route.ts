import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quotes')
    .select('*, customers(id, name, phone, email, address)')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  return NextResponse.json(data)
}
