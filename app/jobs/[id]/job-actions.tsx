'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
      
      const res = await fetch(`/api/jobs/${jobId}/update-amount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_amount: amount }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update amount')
      }
      
      setError('')
      toast.success('Job amount saved!')
      router.refresh()
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
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
      
      const res = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_amount: amount, notes: '' }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete job')
      }
      
      toast.success('Job completed!')
      router.refresh()
      router.push('/')
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
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
            type="button"
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
          type="button"
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
