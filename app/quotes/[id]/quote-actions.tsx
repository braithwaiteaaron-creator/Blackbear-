'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Quote {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  property_address: string
  description: string
  service_type: string
  amount: number
}

export function QuoteActions({ quote }: { quote: Quote }) {
  const router = useRouter()
  const [acting, setActing] = useState(false)

  async function handleAccept() {
    setActing(true)
    const supabase = createClient()
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quote.id)
    const { data: job } = await supabase
      .from('jobs')
      .insert({
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        customer_phone: quote.customer_phone,
        address: quote.property_address,
        description: quote.description || quote.service_type,
        estimated_amount: quote.amount,
        status: 'in_progress',
        tenant_id: '00000000-0000-0000-0000-000000000001',
      })
      .select()
      .single()
    if (job) {
      router.push(`/jobs/${job.id}`)
    } else {
      router.push('/')
    }
  }

  async function handleReject() {
    setActing(true)
    const supabase = createClient()
    await supabase.from('quotes').update({ status: 'rejected' }).eq('id', quote.id)
    router.push('/quotes')
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={handleAccept}
        disabled={acting}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle className="size-5" />
        {acting ? 'Accepting...' : 'Accept'}
      </button>
      <button
        onClick={handleReject}
        disabled={acting}
        className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <X className="size-5" />
        {acting ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  )
}
