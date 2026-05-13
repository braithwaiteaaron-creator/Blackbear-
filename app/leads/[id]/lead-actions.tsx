'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LeadActionsProps {
  leadId: string
  initialStatus: string
  lead: {
    customer_name: string
    customer_email: string
    customer_phone: string
    property_address: string
    estimated_value: number
  }
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-emerald-500' },
  { value: 'converted', label: 'Converted', color: 'bg-cyan-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
]

export function LeadActions({ leadId, initialStatus, lead }: LeadActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [updating, setUpdating] = useState(false)
  const [converting, setConverting] = useState(false)

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId)
    setStatus(newStatus)
    setUpdating(false)
  }

  async function convertToQuote() {
    setConverting(true)
    const supabase = createClient()
    const { data: quote } = await supabase
      .from('quotes')
      .insert({
        description: lead.customer_name,
        service_type: 'pruning',
        amount: lead.estimated_value || 0,
        status: 'pending',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        tenant_id: '00000000-0000-0000-0000-000000000001',
      })
      .select()
      .single()
    if (quote) {
      await supabase.from('leads').update({ status: 'converted' }).eq('id', leadId)
      router.push(`/quotes/${quote.id}`)
    } else {
      setConverting(false)
    }
  }

  return (
    <>
      <div className="p-4 rounded-xl bg-card border border-border/50">
        <h2 className="font-semibold mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              type="button"
              key={s.value}
              onClick={() => updateStatus(s.value)}
              disabled={updating}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                status === s.value
                  ? `${s.color} text-white`
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {status !== 'converted' && (
        <button
          type="button"
          onClick={convertToQuote}
          disabled={converting}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
        >
          <UserPlus className="size-5" />
          {converting ? 'Converting...' : 'Convert to Quote'}
        </button>
      )}

      {status === 'converted' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <p className="text-emerald-400 font-medium">Lead converted to a quote.</p>
        </div>
      )}
    </>
  )
}
