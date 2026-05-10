import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewCustomerPage() {
  async function createCustomer(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const notes = formData.get('notes') as string

    const { error } = await supabase.from('customers').insert({
      name,
      phone,
      email: email || null,
      address,
      city: city || null,
      notes: notes || null,
    })

    if (error) {
      console.error('Error creating customer:', error)
    }

    redirect('/?tab=customers')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/?tab=customers" className="p-2 -ml-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-bold">New Customer</h1>
        </div>
      </header>

      <form action={createCustomer} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Name *</label>
          <input type="text" name="name" required placeholder="John Smith" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Phone *</label>
          <input type="tel" name="phone" required placeholder="416-555-1234" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
          <input type="email" name="email" placeholder="john@example.com" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Address *</label>
          <input type="text" name="address" required placeholder="123 Main St" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">City</label>
          <input type="text" name="city" placeholder="Toronto" className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Notes</label>
          <textarea name="notes" rows={3} placeholder="Customer notes..." className="w-full p-4 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground resize-none" />
        </div>

        <button type="submit" className="w-full py-4 px-6 bg-primary text-primary-foreground font-bold text-lg rounded-xl active:scale-95 transition-transform">
          Add Customer
        </button>

        <Link href="/?tab=customers" className="block w-full py-4 px-6 bg-card border border-border text-foreground font-medium text-lg rounded-xl text-center">
          Cancel
        </Link>
      </form>
    </div>
  )
}
