'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Quote {
  id: string
  status: string
  service_type: string
  description: string
  notes: string
  amount: number
  valid_until: string
  customer_name: string
  customer_email: string
  customer_phone: string
  property_address: string
  customers: { id: string; name: string; phone: string; email: string; address: string } | null
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (!err && data) setQuote(data)
        setLoading(false)
      })
  }, [id])

  async function updateStatus(status: string) {
    setActing(true)
    const supabase = createClient()
    await supabase.from('quotes').update({ status }).eq('id', id)
    if (status === 'accepted') {
      // Convert to job
      const { data: job } = await supabase
        .from('jobs')
        .insert({
          customer_name: quote!.customer_name,
          customer_email: quote!.customer_email,
          customer_phone: quote!.customer_phone,
          property_address: quote!.property_address,
          description: quote!.description || quote!.service_type,
          estimated_amount: quote!.amount,
          status: 'in_progress',
          tenant_id: '00000000-0000-0000-0000-000000000001',
        })
        .select()
        .single()
      if (job) { router.push(`/jobs/${job.id}`); return }
    }
    router.push('/quotes')
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>
  if (!quote) return <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Quote not found</h1>
      <Link href="/quotes" className="text-primary hover:underline">Back to quotes</Link>
    </div>
  </div>

  const amount = Number(quote.amount)
  const labour = amount * 0.45
  const materials = amount * 0.20
  const overhead = amount * 0.15
  const tax = amount * 0.13
  const profit = amount * 0.07

  const customerName = quote.customers?.name || quote.customer_name
  const customerPhone = quote.customers?.phone || quote.customer_phone
  const customerEmail = quote.customers?.email || quote.customer_email
  const customerAddress = quote.customers?.address || quote.property_address

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/quotes" className="text-primary-foreground/70 hover:text-primary-foreground">
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-2xl font-bold">Quote Details</h1>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            quote.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
            quote.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1)}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-32 space-y-6">
        <Card className="bg-card border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Name</p><p className="font-semibold">{customerName}</p></div>
            <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-semibold">{customerPhone}</p></div>
            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-semibold">{customerEmail}</p></div>
            <div><p className="text-sm text-muted-foreground">Address</p><p className="font-semibold">{customerAddress}</p></div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div><p className="text-sm text-muted-foreground">Service Type</p><p className="font-semibold text-lg">{quote.service_type}</p></div>
            {quote.description && <div><p className="text-sm text-muted-foreground">Description</p><p className="font-semibold">{quote.description}</p></div>}
            {quote.notes && <div><p className="text-sm text-muted-foreground">Notes</p><p className="font-semibold">{quote.notes}</p></div>}
            {quote.valid_until && <div><p className="text-sm text-muted-foreground">Valid Until</p><p className="font-semibold">{new Date(quote.valid_until).toLocaleDateString()}</p></div>}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardHeader className="border-b border-border/50">
            <CardTitle>Quote Amount & Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border/50">
              <span className="font-semibold">Subtotal</span>
              <span className="text-2xl font-bold">${amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Labour (45%)</span><span className="font-semibold">${labour.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Materials (20%)</span><span className="font-semibold">${materials.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Overhead (15%)</span><span className="font-semibold">${overhead.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (13%)</span><span className="font-semibold">${tax.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Profit (7%)</span><span className="font-semibold">${profit.toLocaleString()}</span></div>
          </CardContent>
        </Card>

        {quote.status === 'pending' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => updateStatus('accepted')}
              disabled={acting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="size-5" /> Accept Quote
            </button>
            <button
              onClick={() => updateStatus('rejected')}
              disabled={acting}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="size-5" /> Reject Quote
            </button>
          </div>
        )}

        {quote.status === 'accepted' && (
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="size-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-400 font-semibold">This quote has been accepted</p>
            </CardContent>
          </Card>
        )}

        {quote.status === 'rejected' && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-6 text-center">
              <X className="size-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-semibold">This quote has been rejected</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
