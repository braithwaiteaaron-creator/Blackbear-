import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Users, Mail, Phone, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const supabase = await createClient()

  // Fetch unique customers from jobs and quotes
  const { data: jobCustomers } = await supabase
    .from('jobs')
    .select('customer_email, customer_phone, address')
    .not('customer_email', 'is', null)

  const { data: quoteCustomers } = await supabase
    .from('quotes')
    .select('id, description')
    .not('description', 'is', null)

  // Combine and deduplicate
  const customerMap = new Map()
  
  jobCustomers?.forEach((job: any) => {
    const key = job.customer_email || job.customer_phone
    if (key && !customerMap.has(key)) {
      customerMap.set(key, {
        email: job.customer_email,
        phone: job.customer_phone,
        address: job.address,
        jobCount: 1,
      })
    }
  })

  const customers = Array.from(customerMap.values())

  return (
    <div className="min-h-screen bg-background">
      {/* Exit Button */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          href="/"
          className="inline-flex items-center justify-center size-10 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
          title="Exit Customers"
        >
          <X className="size-5 text-foreground" />
        </Link>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="p-4 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-6 text-primary" />
            <h1 className="text-2xl font-bold">Customers</h1>
          </div>
          <p className="text-sm text-muted-foreground">{customers.length} total customers</p>
        </div>
      </div>

      {/* Customer List */}
      <div className="p-4 max-w-2xl space-y-2">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No customers yet</p>
          </div>
        ) : (
          customers.map((customer: any, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {customer.address || 'Unknown'}
                  </div>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 flex-shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
