import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LeadActions } from './lead-actions'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) notFound()

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

        <LeadActions
          leadId={lead.id}
          initialStatus={lead.status}
          lead={lead}
        />
      </main>
    </div>
  )
}
