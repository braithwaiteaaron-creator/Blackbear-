'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Quote {
  id: string
  description: string
  service_type: string
  amount: number
  status: string
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
        description: quote.description,
        address: quote.description, // Use description as address
        service_type: quote.service_type,
        estimated_amount: quote.amount,
        actual_amount: quote.amount,
        status: 'quote',
        quote_id: quote.id,
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
        type="button"
        onClick={handleAccept}
        disabled={acting}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle className="size-5" />
        {acting ? 'Accepting...' : 'Accept'}
      </button>
      <button
        type="button"
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
