import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, UserPlus } from 'lucide-react'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  async function updateStatus(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const newStatus = formData.get('status') as string
    
    await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id)

    redirect(`/leads/${id}`)
  }

  async function convertToCustomer() {
    'use server'
    const supabase = await createClient()
    
    // Create customer from lead
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating customer:', customerError)
      return
    }

    // Update lead status to converted
    await supabase
      .from('leads')
      .update({ 
        status: 'converted',
        converted_customer_id: customer.id 
      })
      .eq('id', id)

    redirect(`/customers/${customer.id}`)
  }

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
        {/* Contact Info */}
        <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
          <h2 className="font-semibold text-foreground">Contact Information</h2>
          
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
              <Phone className="size-4" />
              <span>{lead.phone}</span>
            </a>
          )}
          
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
              <Mail className="size-4" />
              <span>{lead.email}</span>
            </a>
          )}
          
          {lead.address && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="size-4" />
              <span>{lead.address}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="size-4" />
            <span>Added {new Date(lead.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Lead Source */}
        {lead.source && (
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <h2 className="font-semibold text-foreground mb-1">Lead Source</h2>
            <p className="text-muted-foreground capitalize">{lead.source.replace('_', ' ')}</p>
          </div>
        )}

        {/* Notes */}
        {lead.notes && (
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <h2 className="font-semibold text-foreground mb-1">Notes</h2>
            <p className="text-muted-foreground">{lead.notes}</p>
          </div>
        )}

        {/* Status Update */}
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <h2 className="font-semibold text-foreground mb-3">Update Status</h2>
          <form action={updateStatus} className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                type="submit"
                name="status"
                value={status.value}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  lead.status === status.value
                    ? `${status.color} text-white`
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {status.label}
              </button>
            ))}
          </form>
        </div>

        {/* Convert to Customer */}
        {lead.status !== 'converted' && (
          <form action={convertToCustomer}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
            >
              <UserPlus className="size-5" />
              Convert to Customer
            </button>
          </form>
        )}

        {/* Already Converted */}
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
