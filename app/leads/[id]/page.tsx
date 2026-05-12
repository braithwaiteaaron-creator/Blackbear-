'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, UserPlus } from 'lucide-react'

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  address: string
  source: string
  notes: string
  status: string
  created_at: string
  converted_customer_id: string | null
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    async function fetchLead() {
      const res = await fetch(`/api/leads/${id}/detail`)
      if (res.ok) setLead(await res.json())
      setLoading(false)
    }
    fetchLead()
  }, [id])

  async function updateStatus(status: string) {
    setUpdating(true)
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setLead(prev => prev ? { ...prev, status } : prev)
    setUpdating(false)
  }

  async function convertToCustomer() {
    setConverting(true)
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: lead!.name,
        phone: lead!.phone,
        email: lead!.email,
        address: lead!.address,
        tenant_id: '00000000-0000-0000-0000-000000000001',
      }),
    })
    if (res.ok) {
      const customer = await res.json()
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'converted', converted_customer_id: customer.id }),
      })
      router.push(`/customers/${customer.id}`)
    }
    setConverting(false)
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
            <h1 className="text-xl font-bold">{lead.name}</h1>
            <p className="text-sm text-primary-foreground/70 capitalize">{lead.status} Lead</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
          <h2 className="font-semibold">Contact Information</h2>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
              <Phone className="size-4" /><span>{lead.phone}</span>
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
              <Mail className="size-4" /><span>{lead.email}</span>
            </a>
          )}
          {lead.address && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="size-4" /><span>{lead.address}</span>
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

        {lead.status === 'converted' && lead.converted_customer_id && (
          <Link
            href={`/customers/${lead.converted_customer_id}`}
            className="w-full block text-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl transition-colors"
          >
            View Customer Profile
          </Link>
        )}
      </main>
    </div>
  )
}
