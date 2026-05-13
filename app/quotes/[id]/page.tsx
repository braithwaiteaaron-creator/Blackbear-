import Link from 'next/link'
import { ArrowLeft, CheckCircle, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { QuoteActions } from './quote-actions'
import { SignaturePad } from '@/components/signature-pad'

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single()

  const { data: signature } = await supabase
    .from('quote_signatures')
    .select('*')
    .eq('quote_id', id)
    .single()

  if (error || !quote) notFound()

  const amount = Number(quote.amount || 0)
  const labour = amount * 0.45
  const materials = amount * 0.20
  const overhead = amount * 0.15
  const tax = amount * 0.13
  const profit = amount * 0.07

  const customerName = quote.customer_name
  const customerPhone = quote.customer_phone
  const customerEmail = quote.customer_email
  const customerAddress = quote.property_address

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
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/30">
          <CardHeader className="border-b border-border/50">
            <CardTitle>Amount & Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border/50">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold">${amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Labour (45%)</span><span className="font-semibold text-blue-400">${labour.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Materials (20%)</span><span className="font-semibold text-amber-400">${materials.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Overhead (15%)</span><span className="font-semibold text-purple-400">${overhead.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (13%)</span><span className="font-semibold text-cyan-400">${tax.toFixed(2)}</span></div>
            <div className="flex justify-between pt-3 border-t border-border/50"><span className="text-muted-foreground">Profit (7%)</span><span className="font-bold text-emerald-400">${profit.toFixed(2)}</span></div>
          </CardContent>
        </Card>

        {quote.status === 'pending' && (
          <QuoteActions quote={quote} />
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

        {/* Signature Section */}
        {!signature && quote.status !== 'accepted' && quote.status !== 'rejected' && (
          <SignaturePad quoteId={id} />
        )}

        {signature && (
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardHeader>
              <CardTitle>Signed by Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-semibold">{signature.customer_name}</p>
              </div>
              {signature.customer_email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{signature.customer_email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Signed On</p>
                <p className="font-semibold">
                  {new Date(signature.signed_at).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 border-t border-emerald-500/30 pt-4">
                <p className="text-xs text-muted-foreground mb-2">Signature</p>
                <img
                  src={signature.signature_data}
                  alt="Customer Signature"
                  className="border border-border rounded"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
