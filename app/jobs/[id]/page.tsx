'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Job {
  id: string
  job_number: string
  service_type: string
  status: string
  actual_amount: number | null
  estimated_amount: number | null
  description: string
  notes: string
  address: string
  customer_phone: string | null
  customer_email: string | null
  customer_id: string | null
  paid: boolean
  completed_date: string | null
  created_at: string
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [finalAmount, setFinalAmount] = useState('')

  useEffect(() => {
    async function load() {
      if (!id) {
        setError('No job ID provided')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const supabase = createClient()
        const { data, error: err } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single()
        
        if (err) throw new Error(err.message)
        if (!data) throw new Error('Job not found')
        
        setJob(data)
        const amt = String(data.actual_amount ?? data.estimated_amount ?? 0)
        setNewAmount(amt)
        setFinalAmount(amt)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load job')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleSaveAmount() {
    if (!job || !newAmount) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('jobs')
        .update({ actual_amount: parseFloat(newAmount) })
        .eq('id', job.id)
      if (err) throw err
      setJob({ ...job, actual_amount: parseFloat(newAmount) })
      setFinalAmount(newAmount)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update amount')
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete() {
    if (!job) return
    setCompleting(true)
    try {
      const supabase = createClient()
      const amount = parseFloat(finalAmount)
      
      await supabase
        .from('jobs')
        .update({ 
          status: 'completed', 
          paid: true, 
          actual_amount: amount,
          time_ended_at: new Date().toISOString(),
          completed_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', job.id)
      
      await supabase.from('payment_allocations').insert({
        job_id: job.id,
        labour_cost: amount * 0.45,
        material_cost: amount * 0.20,
        overhead_cost: amount * 0.15,
        tax_cost: amount * 0.13,
        profit: amount * 0.07,
      })
      
      router.push('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete job')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading job...</p>
      </div>
    </div>
  )

  if (error || !job) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <p className="text-red-400 font-medium">Error loading job</p>
        <p className="text-muted-foreground text-sm">{error || 'Job not found'}</p>
        <Link href="/" className="text-primary underline block">Go back to Dashboard</Link>
      </div>
    </div>
  )

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

        {/* Update Amount */}
        {!isCompleted && (
          <div className="space-y-3">
            <h3 className="font-semibold">Update Job Amount</h3>
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

        {/* Complete Job */}
        {!isCompleted && (
          <div className="space-y-4 pb-8">
            <h3 className="font-semibold">Complete Job</h3>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Final Amount ($)</label>
              <input
                type="number"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                step="0.01"
                className="w-full p-3 rounded-xl bg-card border border-border text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleComplete}
              disabled={completing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
            >
              {completing ? 'Completing...' : 'Mark Complete & Save'}
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center pb-8">
            <p className="text-emerald-400 font-medium">Job completed and paid.</p>
          </div>
        )}
      </div>
    </div>
  )
}
