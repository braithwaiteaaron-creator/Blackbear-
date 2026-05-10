'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, FileText, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>
}

interface Quote {
  id: string
  quote_number: string
  customer_id: string
  service_type: string
  description: string
  amount: number
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired'
  valid_until?: string
  created_at: string
  customer?: { name: string; phone?: string; address?: string }
}

export default function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  const resolveParams = async () => {
    const { id } = await params
    loadQuote(id)
  }

  const loadQuote = async (quoteId: string) => {
    const supabase = await createClient()
    
    const { data: quoteData } = await supabase
      .from('quotes')
      .select('*, customer:customers(name, phone, address)')
      .eq('id', quoteId)
      .single()

    setQuote(quoteData)
    setLoading(false)
  }

  const updateQuoteStatus = async (newStatus: Quote['status']) => {
    if (!quote) return
    setUpdating(true)
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('quotes')
      .update({ status: newStatus })
      .eq('id', quote.id)

    if (!error) {
      setQuote({ ...quote, status: newStatus })
      setTimeout(() => router.back(), 1000)
    }
    setUpdating(false)
  }

  const convertToJob = async () => {
    if (!quote) return
    setUpdating(true)
    
    const supabase = await createClient()
    
    // Create job from quote
    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert({
        customer_id: quote.customer_id,
        job_number: `JOB-${Date.now()}`,
        service_type: quote.service_type,
        description: quote.description,
        estimated_amount: quote.amount,
        status: 'scheduled',
      })
      .select()
      .single()

    if (!error) {
      // Update quote to accepted
      await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', quote.id)

      setTimeout(() => router.push('/jobs'), 1000)
    }
    setUpdating(false)
  }

  useEffect(() => {
    resolveParams()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="h-40 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Quote not found</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    sent: 'bg-blue-500/10 text-blue-700 border-blue-200',
    accepted: 'bg-green-500/10 text-green-700 border-green-200',
    rejected: 'bg-red-500/10 text-red-700 border-red-200',
    expired: 'bg-gray-500/10 text-gray-700 border-gray-200',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{quote.quote_number}</h1>
              <p className="text-sm text-muted-foreground">{quote.customer?.name}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border text-xs font-medium ${statusColors[quote.status]}`}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        {/* Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Quote Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Service Type</p>
                <p className="font-medium">{quote.service_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(quote.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="p-3 bg-muted rounded text-sm">{quote.description}</p>
            </div>
            {quote.valid_until && (
              <div>
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <p className="font-medium">{new Date(quote.valid_until).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amount */}
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="size-5 text-primary" />
                <span className="text-muted-foreground">Quote Amount</span>
              </div>
              <p className="text-3xl font-bold text-primary">${quote.amount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        {quote.customer && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{quote.customer.name}</p>
              </div>
              {quote.customer.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{quote.customer.phone}</p>
                </div>
              )}
              {quote.customer.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{quote.customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-4">
          {quote.status === 'pending' || quote.status === 'sent' ? (
            <>
              <Button 
                onClick={convertToJob}
                disabled={updating}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
              >
                <CheckCircle2 className="size-5 mr-2" />
                {updating ? 'Converting...' : 'Accept & Create Job'}
              </Button>
              <Button 
                onClick={() => updateQuoteStatus('rejected')}
                disabled={updating}
                variant="outline"
                className="w-full h-12 text-base"
              >
                Reject Quote
              </Button>
            </>
          ) : quote.status === 'accepted' ? (
            <Button disabled className="w-full h-12 text-base bg-green-500/20 text-green-700">
              <CheckCircle2 className="size-5 mr-2" />
              Quote Accepted
            </Button>
          ) : quote.status === 'rejected' ? (
            <Button disabled className="w-full h-12 text-base bg-red-500/20 text-red-700">
              Quote Rejected
            </Button>
          ) : null}
          
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full h-12 text-base">
              <ArrowLeft className="size-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
