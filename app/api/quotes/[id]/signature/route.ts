import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params
    const { signature_data, customer_name, customer_email } = await request.json()

    if (!signature_data || !customer_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Save signature to database
    const { data, error } = await supabase
      .from('quote_signatures')
      .insert({
        quote_id: quoteId,
        signature_data,
        customer_name,
        customer_email,
      })
      .select()
      .single()

    if (error) throw error

    // Update quote status to signed
    await supabase
      .from('quotes')
      .update({ status: 'signed' })
      .eq('id', quoteId)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Signature save error:', error)
    return NextResponse.json(
      { error: 'Failed to save signature' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('quote_signatures')
      .select('*')
      .eq('quote_id', quoteId)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(null)
    }

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Signature fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signature' },
      { status: 500 }
    )
  }
}
