import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { JobActions } from './job-actions'
import { PhotoUpload } from '@/components/photo-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  const { data: photos } = await supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  if (error || !job) {
    notFound()
  }

  const amount = job.actual_amount ?? job.estimated_amount ?? 0
  const labour = amount * 0.45
  const materials = amount * 0.20
  const overhead = amount * 0.15
  const tax = amount * 0.13
  const profit = amount * 0.07
  const isCompleted = job.status === 'completed'

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{job.job_number || 'Job Details'}</h1>
            <p className="text-sm text-primary-foreground/80">{job.service_type || job.description}</p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
              <CheckCircle className="size-4" />
              <span className="text-sm font-medium">Done</span>
            </div>
          )}
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Job Details */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Job Details</h2>
          <div className="flex justify-between p-3 bg-card rounded-lg border border-border/50">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{job.customer_phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between p-3 bg-card rounded-lg border border-border/50">
            <span className="text-muted-foreground">Address</span>
            <span className="font-medium text-right max-w-[60%]">{job.address || job.description || 'N/A'}</span>
          </div>
          <div className="flex justify-between p-3 bg-card rounded-lg border border-border/50">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{job.status}</span>
          </div>
          <div className="flex justify-between p-3 bg-card rounded-lg border border-border/50">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-emerald-400">${amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Payment Breakdown</h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-muted-foreground">Total</span>
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
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="text-muted-foreground">Profit (7%)</span>
              <span className="font-bold text-emerald-400">${profit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Job Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload jobId={id} photos={photos || []} />
          </CardContent>
        </Card>

        {/* Actions (Client Component) */}
        <JobActions jobId={job.id} initialAmount={amount} isCompleted={isCompleted} />
      </div>
    </div>
  )
}
