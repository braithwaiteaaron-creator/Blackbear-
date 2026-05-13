'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail, Phone, MapPin, DollarSign, FileText, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [quotes, setQuotes] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ id }) => setCustomerId(id))
  }, [params])

  useEffect(() => {
    if (!customerId) return

    async function fetchData() {
      const supabase = createClient()

      // Fetch customer
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      setCustomer(customerData)

      // Fetch customer quotes
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      setQuotes(quotesData || [])

      // Fetch customer jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      setJobs(jobsData || [])
      setLoading(false)
    }

    fetchData()
  }, [customerId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
          <div className="p-4 max-w-4xl">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-8 w-40" />
            </div>
          </div>
        </div>
        <div className="p-4 max-w-4xl space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Customer not found</p>
          <Link href="/customers" className="text-primary hover:underline mt-2 inline-block">
            Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  const totalSpent = jobs.reduce((sum, job) => sum + (job.actual_amount || job.estimated_amount || 0), 0)
  const totalQuoted = quotes.reduce((sum, quote) => sum + (quote.amount || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="p-4 max-w-4xl">
          <Link
            href="/customers"
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-3 w-fit"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{customer.email}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl space-y-6">
        {/* Customer Info */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="size-5" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.email && (
              <div className="flex items-start gap-3">
                <Mail className="size-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="size-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Quoted</p>
            <p className="text-xl font-bold text-primary">${totalQuoted.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
            <p className="text-xl font-bold text-emerald-500">${totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Jobs Completed</p>
            <p className="text-xl font-bold">{jobs.filter(j => j.status === 'completed').length}</p>
          </div>
        </div>

        {/* Quotes */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="size-5" />
            Quotes ({quotes.length})
          </h2>
          {quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quotes</p>
          ) : (
            <div className="space-y-2">
              {quotes.map(quote => (
                <div key={quote.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{quote.service_type}</p>
                    <p className="text-xs text-muted-foreground">{quote.description}</p>
                  </div>
                  <p className="font-bold">${quote.amount?.toLocaleString() || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jobs */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="size-5" />
            Jobs ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs</p>
          ) : (
            <div className="space-y-2">
              {jobs.map(job => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{job.address}</p>
                    <p className="text-xs text-muted-foreground capitalize">{job.status}</p>
                  </div>
                  <p className="font-bold">${(job.actual_amount || job.estimated_amount || 0).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
