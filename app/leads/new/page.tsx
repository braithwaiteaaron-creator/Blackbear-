import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewLeadPage() {
  async function createLead(formData: FormData) {
    'use server'
    const supabase = await createClient()
    
    const { error } = await supabase.from('leads').insert({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || null,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string || null,
      source: formData.get('source') as string || 'direct',
      notes: formData.get('notes') as string || null,
      status: 'new',
    })

    if (error) {
      console.error('Error creating lead:', error)
      return
    }

    redirect('/leads')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Link href="/leads" className="p-2 hover:bg-primary-foreground/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-bold">New Lead</h1>
        </div>
      </header>

      <main className="p-4">
        <form action={createLead} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Address</label>
            <input
              type="text"
              name="address"
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none"
              placeholder="123 Main St, City, ST"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Lead Source</label>
            <select
              name="source"
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none"
            >
              <option value="direct">Direct</option>
              <option value="referral">Referral</option>
              <option value="website">Website</option>
              <option value="social">Social Media</option>
              <option value="google">Google</option>
              <option value="door_knock">Door Knock</option>
              <option value="spotted">Spotted (Damage)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none resize-none"
              placeholder="Additional notes about this lead..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Create Lead
          </button>
        </form>
      </main>
    </div>
  )
}
