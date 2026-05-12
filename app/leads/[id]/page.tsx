'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Lead {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  property_address: string
  estimated_value: number
  source: string
  notes: string
  status: string
  created_at: string
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (!err && data) setLead(data)
        setLoading(false)
      })
  }, [id])

  async function updateStatus(status: string) {
    if (!lead) return
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('leads').update({ status }).eq('id', lead.id)
    setLead(prev => prev ? { ...prev, status } : prev)
    setUpdating(false)
  }

  async function convertToCustomer() {
    if (!lead) return
    setConverting(true)
    const supabase = createClient()
    const { data: quote } = await supabase
      .from('quotes')
      .insert({
        customer_name: lead.customer_name,
        customer_email: lead.customer_email,
        customer_phone: lead.customer_phone,
        property_address: lead.property_address,
        amount: lead.estimated_value || 0,
        status: 'pending',
        tenant_id: '00000000-0000-0000-0000-000000000001',
      })
      .select()
      .single()
    if (quote) {
      await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id)
      router.push(`/quotes/${quote.id}`)
    } else {
      setConverting(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>
  if (!lead) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Lead not found</p></div>

  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-amber-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-emerald-500' },
    { value: 'converted', label: 'Converted', color: 'bg-cyan-500' },
    { value: 'lost', label: 'Lost', color: 'bg-red-500' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Link href="/leads" className="p-2 hover:bg-primary-foreground/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{lead.customer_name}</h1>
            <p className="text-sm text-primary-foreground/70 capitalize">{lead.status} Lead</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
          <h2 className="font-semibold">Contact Information</h2>
          {lead.customer_phone && (
            <a href={`tel:${lead.customer_phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
              <Phone className="size-4" /><span>{lead.customer_phone}</span>
            </a>
          )}
          {lead.customer_email && (
            <a href={`mailto:${lead.customer_email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
              <Mail className="size-4" /><span>{lead.customer_email}</span>
            </a>
          )}
          {lead.property_address && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="size-4" /><span>{lead.property_address}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="size-4" />
            <span>Added {new Date(lead.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {lead.source && (
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <h2 className="font-semibold mb-1">Lead Source</h2>
            <p className="text-muted-foreground capitalize">{lead.source.replace('_', ' ')}</p>
          </div>
        )}

        {lead.notes && (
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <h2 className="font-semibold mb-1">Notes</h2>
            <p className="text-muted-foreground">{lead.notes}</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-card border border-border/50">
          <h2 className="font-semibold mb-3">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => updateStatus(status.value)}
                disabled={updating}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  lead.status === status.value
                    ? `${status.color} text-white`
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {lead.status !== 'converted' && (
          <button
            onClick={convertToCustomer}
            disabled={converting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
          >
            <UserPlus className="size-5" />
            {converting ? 'Converting...' : 'Convert to Customer'}
          </button>
        )}

        {lead.status === 'converted' && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <p className="text-emerald-400 font-medium">This lead has been converted to a quote.</p>
          </div>
        )}
      </main>
    </div>
  )
}
