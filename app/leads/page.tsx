import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus, User, Phone, Mail, MapPin, ChevronRight } from 'lucide-react'

export default async function LeadsPage() {
  const supabase = await createClient()
  
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-primary-foreground/10 rounded-lg">
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-xl font-bold">Leads</h1>
          </div>
          <Link 
            href="/leads/new"
            className="flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 px-4 py-2 rounded-xl font-medium"
          >
            <Plus className="size-4" />
            New Lead
          </Link>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Lead Pipeline Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'New', count: leads?.filter(l => l.status === 'new').length || 0, color: 'bg-blue-500/10 text-blue-400' },
            { label: 'Contacted', count: leads?.filter(l => l.status === 'contacted').length || 0, color: 'bg-amber-500/10 text-amber-400' },
            { label: 'Qualified', count: leads?.filter(l => l.status === 'qualified').length || 0, color: 'bg-emerald-500/10 text-emerald-400' },
            { label: 'Converted', count: leads?.filter(l => l.status === 'converted').length || 0, color: 'bg-cyan-500/10 text-cyan-400' },
          ].map((stat) => (
            <div key={stat.label} className={`p-3 rounded-xl ${stat.color} text-center`}>
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Lead List */}
        <div className="space-y-2">
          {!leads || leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="size-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No leads yet</p>
              <p className="text-sm">Add your first lead to start tracking potential customers</p>
            </div>
          ) : (
            leads.map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`}>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{lead.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" /> {lead.phone}
                          </span>
                        )}
                        {lead.address && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="size-3" /> {lead.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lead.status === 'new' ? 'bg-blue-500/15 text-blue-400' :
                      lead.status === 'contacted' ? 'bg-amber-500/15 text-amber-400' :
                      lead.status === 'qualified' ? 'bg-emerald-500/15 text-emerald-400' :
                      'bg-cyan-500/15 text-cyan-400'
                    }`}>
                      {lead.status}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
