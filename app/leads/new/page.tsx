'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      customer_name: (form.elements.namedItem('name') as HTMLInputElement).value,
      customer_phone: (form.elements.namedItem('phone') as HTMLInputElement).value || null,
      customer_email: (form.elements.namedItem('email') as HTMLInputElement).value || null,
      property_address: (form.elements.namedItem('address') as HTMLInputElement).value || null,
      source: (form.elements.namedItem('source') as HTMLSelectElement).value || 'direct',
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
      estimated_value: 0,
      status: 'new',
      tenant_id: '00000000-0000-0000-0000-000000000001',
    }

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push('/leads')
    } else {
      const json = await res.json()
      setError(json.error || 'Failed to create lead')
      setLoading(false)
    }
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
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name *</label>
            <input id="name" type="text" name="name" required
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Smith" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input id="phone" type="tel" name="phone"
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="(555) 123-4567" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input id="email" type="email" name="email"
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="john@example.com" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">Address</label>
            <input id="address" type="text" name="address"
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="123 Main St, City, ST" />
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-foreground mb-1">Lead Source</label>
            <select id="source" name="source"
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary">
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
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea id="notes" name="notes" rows={3}
              className="w-full p-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Additional notes..." />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
        </form>
      </main>
    </div>
  )
}
