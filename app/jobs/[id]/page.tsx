import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, FileText, Package, Camera } from 'lucide-react'

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  
  // Fetch job with customer
  const { data: job } = await supabase
    .from('jobs')
    .select('*, customer:customers(name, phone, address)')
    .eq('id', params.id)
    .single()

  if (!job) {
    return <div className="p-4 text-center">Job not found</div>
  }

  // Calculate payment buckets (45/20/15/13/7%)
  const amount = job.actual_amount || job.estimated_amount || 0
  const labour = amount * 0.45
  const materials = amount * 0.20
  const overhead = amount * 0.15
  const tax = amount * 0.13
  const profit = amount * 0.07

  async function completeJob(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const finalAmount = parseFloat(formData.get('final_amount') as string) || amount
    
    // Update job status and amount
    await supabase
      .from('jobs')
      .update({
        status: 'completed',
        paid: true,
        actual_amount: finalAmount,
        time_ended_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    // Create payment allocation record
    const finalLabour = finalAmount * 0.45
    const finalMaterials = finalAmount * 0.20
    const finalOverhead = finalAmount * 0.15
    const finalTax = finalAmount * 0.13
    const finalProfit = finalAmount * 0.07

    await supabase.from('payment_allocations').insert({
      job_id: job.id,
      labour_cost: finalLabour,
      material_cost: finalMaterials,
      overhead_cost: finalOverhead,
      tax_cost: finalTax,
      profit: finalProfit,
    })

    redirect('/?tab=jobs')
  }

  const isCompleted = job.status === 'completed'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/?tab=jobs" className="p-2 -ml-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{job.job_number}</h1>
            <p className="text-sm text-primary-foreground/80">{job.service_type}</p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
              <CheckCircle className="size-4" />
              <span className="text-sm font-medium">Done</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        
        {/* Job Details */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Job Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between p-3 bg-card rounded-lg border border-border/50">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{job.customer?.name}</span>
            </div>
            <div className="flex justify-between p-3 bg-card rounded-lg border border-border/50">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium text-right">{job.customer?.address || job.description}</span>
            </div>
            <div className="flex justify-between p-3 bg-card rounded-lg border border-border/50">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{job.status}</span>
            </div>
            <div className="flex justify-between p-3 bg-card rounded-lg border border-border/50">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-emerald-400">${(job.actual_amount || job.estimated_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Payment Breakdown</h2>
          <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/30 p-4 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border/50">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-lg">${amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Labour (45%)</span>
              <span className="font-semibold text-blue-400">${labour.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Materials (20%)</span>
              <span className="font-semibold text-amber-400">${materials.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overhead (15%)</span>
              <span className="font-semibold text-purple-400">${overhead.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (13%)</span>
              <span className="font-semibold text-cyan-400">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border/50">
              <span className="text-muted-foreground">Profit (7%)</span>
              <span className="font-bold text-emerald-400">${profit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Job Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/jobs/${job.id}/materials`}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
          >
            <Package className="size-5 text-amber-400" />
            <span className="font-medium">Materials</span>
          </Link>
          <Link
            href={`/jobs/${job.id}/photos`}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
          >
            <Camera className="size-5 text-blue-400" />
            <span className="font-medium">Photos</span>
          </Link>
        </div>

        {/* Complete Job Form */}
        {!isCompleted && (
          <form action={completeJob} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Final Amount (optional)</label>
              <input 
                type="number" 
                name="final_amount" 
                defaultValue={amount.toFixed(2)}
                step="0.01"
                className="w-full p-3 rounded-xl bg-card border border-border text-foreground text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Notes</label>
              <textarea 
                name="notes" 
                placeholder="Job completion notes..."
                className="w-full p-3 rounded-xl bg-card border border-border text-foreground text-base"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Mark Job Complete & Create Invoice
            </button>
          </form>
        )}

        {isCompleted && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-emerald-400 font-medium text-center">This job has been completed and paid.</p>
            </div>
            <Link
              href={`/api/invoices/${job.id}`}
              target="_blank"
              className="w-full block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors gap-2 flex items-center justify-center"
            >
              <FileText className="size-5" />
              View Invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
