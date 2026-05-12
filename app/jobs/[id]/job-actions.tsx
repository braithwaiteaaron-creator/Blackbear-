'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface JobActionsProps {
  jobId: string
  initialAmount: number
  isCompleted: boolean
}

export function JobActions({ jobId, initialAmount, isCompleted }: JobActionsProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState('')
  const [newAmount, setNewAmount] = useState(String(initialAmount))
  const [finalAmount, setFinalAmount] = useState(String(initialAmount))

  async function handleSaveAmount() {
    if (!newAmount) {
      setError('Please enter an amount')
      return
    }
    setSaving(true)
    setError('')
    try {
      const amount = parseFloat(newAmount)
      if (isNaN(amount)) {
        throw new Error('Invalid amount entered')
      }
      console.log("[v0] Saving job amount:", { jobId, amount })
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('jobs')
        .update({ actual_amount: amount })
        .eq('id', jobId)
        .select()
      
      console.log("[v0] Update response:", { data, error: err })
      
      if (err) {
        console.error("[v0] Supabase error:", err.message)
        setError(`Error: ${err.message}`)
      } else {
        console.log("[v0] Job amount saved successfully")
        setError('')
        alert('Job amount saved! Refreshing...')
        window.location.reload()
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error("[v0] Exception saving amount:", errorMsg)
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete() {
    if (!finalAmount) {
      setError('Please enter a final amount')
      return
    }
    setCompleting(true)
    setError('')
    try {
      const amount = parseFloat(finalAmount)
      if (isNaN(amount)) {
        throw new Error('Invalid amount entered')
      }
      console.log("[v0] Completing job:", { jobId, amount })
      const supabase = createClient()
      
      const { error: err1 } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed', 
          paid: true, 
          actual_amount: amount,
          time_ended_at: new Date().toISOString(),
          completed_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', jobId)
      
      if (err1) {
        console.error("[v0] Error updating job:", err1.message)
        throw new Error(`Job update failed: ${err1.message}`)
      }

      console.log("[v0] Job updated, creating payment allocation")
      
      const { error: err2 } = await supabase.from('payment_allocations').insert({
        job_id: jobId,
        labour_cost: amount * 0.45,
        material_cost: amount * 0.20,
        overhead_cost: amount * 0.15,
        tax_cost: amount * 0.13,
        profit: amount * 0.07,
      })

      if (err2) {
        console.error("[v0] Error creating payment allocation:", err2.message)
        throw new Error(`Payment allocation failed: ${err2.message}`)
      }

      console.log("[v0] Job completed successfully")
      alert('Job completed and payment split calculated!')
      window.location.href = '/'
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error("[v0] Error completing job:", errorMsg)
      setError(errorMsg)
    } finally {
      setCompleting(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center pb-8">
        <p className="text-emerald-400 font-medium">Job completed and paid.</p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Update Amount */}
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

      {/* Complete Job */}
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
    </>
  )
}
