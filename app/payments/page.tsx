import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default async function PaymentsPage() {
  const supabase = await createClient()

  // Fetch all completed jobs with payment status
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, customer:customers(name, phone)')
    .in('status', ['completed', 'in_progress', 'scheduled'])
    .order('created_at', { ascending: false })

  const allJobs = jobs || []

  // Calculate payment stats
  const completedJobs = allJobs.filter(j => j.status === 'completed')
  const paidJobs = completedJobs.filter(j => j.paid === true)
  const unpaidJobs = completedJobs.filter(j => j.paid !== true)
  const pendingJobs = allJobs.filter(j => j.status !== 'completed')

  const totalCompleted = completedJobs.reduce((sum, j) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)
  const totalRevenue = paidJobs.reduce((sum, j) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)
  const totalOutstanding = unpaidJobs.reduce((sum, j) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)
  const totalPending = pendingJobs.reduce((sum, j) => sum + (Number(j.estimated_amount) || 0), 0)

  // Payment allocation breakdown (45/20/15/13/7) - based on COMPLETED jobs
  const labour = totalCompleted * 0.45
  const materials = totalCompleted * 0.20
  const overhead = totalCompleted * 0.15
  const taxReserve = totalCompleted * 0.13
  const profit = totalCompleted * 0.07

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-primary-foreground/10 rounded-lg">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-bold">Payments</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="size-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium uppercase">Collected</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{paidJobs.length} paid jobs</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="size-4 text-red-400" />
              <span className="text-xs text-red-400 font-medium uppercase">Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-red-400">${totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{unpaidJobs.length} unpaid jobs</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="size-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium uppercase">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">${totalPending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{pendingJobs.length} in progress</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="size-4 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium uppercase">Total Completed</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">${totalCompleted.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{completedJobs.length} completed jobs</p>
          </div>
        </div>

        {/* Payment Buckets */}
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <h2 className="text-lg font-semibold mb-4">Payment Allocation</h2>
          <p className="text-sm text-muted-foreground mb-4">How your ${totalRevenue.toLocaleString()} collected revenue is allocated:</p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Labour (45%)</span>
              </div>
              <span className="font-semibold">${labour.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm">Materials (20%)</span>
              </div>
              <span className="font-semibold">${materials.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm">Overhead (15%)</span>
              </div>
              <span className="font-semibold">${overhead.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Tax Reserve (13%)</span>
              </div>
              <span className="font-semibold">${taxReserve.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm">Profit (7%)</span>
              </div>
              <span className="font-semibold text-emerald-400">${profit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Unpaid Jobs - Need Action */}
        {unpaidJobs.length > 0 && (
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <h2 className="text-lg font-semibold mb-4 text-red-400">Needs Collection ({unpaidJobs.length})</h2>
            <div className="space-y-3">
              {unpaidJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors">
                    <div>
                      <p className="font-medium">{job.customer?.name || job.address || 'Job'}</p>
                      <p className="text-sm text-muted-foreground">{job.service_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-400">${(Number(job.actual_amount) || Number(job.estimated_amount) || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Unpaid</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Paid Jobs */}
        {paidJobs.length > 0 && (
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400">Collected ({paidJobs.length})</h2>
            <div className="space-y-3">
              {paidJobs.slice(0, 10).map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                    <div>
                      <p className="font-medium">{job.customer?.name || job.address || 'Job'}</p>
                      <p className="text-sm text-muted-foreground">{job.service_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">${(Number(job.actual_amount) || Number(job.estimated_amount) || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Paid</p>
                    </div>
                  </div>
                </Link>
              ))}
              {paidJobs.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">+ {paidJobs.length - 10} more paid jobs</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
