'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, FileText, Package, Camera, Edit2 } from 'lucide-react'

interface Job {
  id: string
  job_number: string
  service_type: string
  status: string
  actual_amount: number
  estimated_amount: number
  description: string
  notes: string
  customer: { name: string; phone: string; address: string } | null
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [finalAmount, setFinalAmount] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function fetchJob() {
      const res = await fetch(`/api/jobs/${id}/detail`)
      if (res.ok) {
        const data = await res.json()
        setJob(data)
        const amt = (data.actual_amount || data.estimated_amount || 0).toFixed(2)
        setNewAmount(amt)
        setFinalAmount(amt)
      }
      setLoading(false)
    }
    fetchJob()
  }, [id])

  async function handleSaveAmount() {
    setSaving(true)
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual_amount: parseFloat(newAmount) }),
    })
    if (res.ok) {
      const updated = { ...job!, actual_amount: parseFloat(newAmount) }
      setJob(updated)
      const amt = parseFloat(newAmount).toFixed(2)
      setFinalAmount(amt)
    }
    setSaving(false)
  }

  async function handleComplete() {
    setCompleting(true)
    const res = await fetch(`/api/jobs/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ final_amount: parseFloat(finalAmount), notes }),
    })
    if (res.ok) {
      router.push('/?tab=jobs')
    } else {
      setCompleting(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>
  if (!job) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Job not found</p></div>

  const amount = job.actual_amount || job.estimated_amount || 0
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
              <span className="font-bold text-emerald-400">${amount.toFixed(2)}</span>
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

        {/* Update Amount */}
        {!isCompleted && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Edit2 className="size-4" />
              Update Job Amount
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                step="0.01"
                placeholder="Enter amount"
                className="flex-1 p-3 rounded-lg bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSaveAmount}
                disabled={saving}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

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

        {/* Complete Job */}
        {!isCompleted && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Final Amount</label>
              <input
                type="number"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                step="0.01"
                className="w-full p-3 rounded-xl bg-card border border-border text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Job completion notes..."
                className="w-full p-3 rounded-xl bg-card border border-border text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
            <button
              onClick={handleComplete}
              disabled={completing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
            >
              {completing ? 'Saving...' : 'Mark Job Complete & Create Invoice'}
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-emerald-400 font-medium text-center">This job has been completed and paid.</p>
            </div>
            <Link
              href={`/api/invoices/${job.id}`}
              target="_blank"
              className="w-full block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <FileText className="size-5" />
                View Invoice
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
