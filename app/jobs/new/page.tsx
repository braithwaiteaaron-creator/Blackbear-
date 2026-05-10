import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewJobPage() {
  const supabase = await createClient()
  
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, address, phone')
    .order('name')

  async function createJob(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    
    const customerId = formData.get('customer_id') as string
    const serviceType = formData.get('service_type') as string
    const address = formData.get('address') as string
    const amount = parseFloat(formData.get('amount') as string) || 0
    const scheduledDate = formData.get('scheduled_date') as string
    const notes = formData.get('notes') as string
    const phone = formData.get('phone') as string

    const { error } = await supabase.from('jobs').insert({
      customer_id: customerId || null,
      service_type: serviceType,
      description: `${serviceType} at ${address}`,
      status: 'scheduled',
      estimated_amount: amount,
      address: address,
      scheduled_date: scheduledDate || null,
      notes: phone ? `Phone: ${phone}. ${notes}` : notes,
      customer_phone: phone,
    })

    if (error) {
      console.error('Error creating job:', error)
    }

    redirect('/?tab=jobs')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/?tab=jobs" className="p-2 -ml-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-bold">New Job</h1>
        </div>
      </header>

      <form action={createJob} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Customer (optional)</label>
          <select name="customer_id" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg">
            <option value="">-- New Customer --</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>{c.name} - {c.address}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Service Type *</label>
          <select name="service_type" required className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg">
            <option value="">Select service...</option>
            <option value="Tree Removal">Tree Removal</option>
            <option value="Pruning">Pruning</option>
            <option value="Stump Grinding">Stump Grinding</option>
            <option value="Tree Trimming">Tree Trimming</option>
            <option value="Emergency">Emergency</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Job Address *</label>
          <input type="text" name="address" required placeholder="123 Main St" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Customer Phone</label>
          <input type="tel" name="phone" placeholder="416-555-1234" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Scheduled Date</label>
          <input type="date" name="scheduled_date" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Estimated Amount ($)</label>
          <input type="number" name="amount" step="0.01" min="0" placeholder="0.00" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Notes</label>
          <textarea name="notes" rows={3} placeholder="Job details..." className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground resize-none" />
        </div>

        <button type="submit" className="w-full py-4 px-6 bg-primary text-primary-foreground font-bold text-lg rounded-xl active:scale-95 transition-transform">
          Create Job
        </button>

        <Link href="/?tab=jobs" className="block w-full py-4 px-6 bg-card border border-border text-foreground font-medium text-lg rounded-xl text-center">
          Cancel
        </Link>
      </form>
    </div>
  )
}
