'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { markJobPaidAction } from '@/app/actions'
import { CheckCircle2 } from 'lucide-react'

interface MarkJobDoneProps {
  jobId: string
  jobNumber: string
  estimatedAmount: number
  onSuccess?: () => void
}

export function MarkJobDoneButton({ jobId, jobNumber, estimatedAmount, onSuccess }: MarkJobDoneProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleMarkDone = async () => {
    setIsLoading(true)
    try {
      const result = await markJobPaidAction(jobId, estimatedAmount)
      if (result.success) {
        setIsDone(true)
        onSuccess?.()
        console.log(`[v0] Job ${jobNumber} marked as paid for $${estimatedAmount}`)
      }
    } catch (error) {
      console.error('[v0] Failed to mark job done:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isDone) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/20 rounded-lg">
        <CheckCircle2 className="size-4 text-primary" />
        <span className="text-sm font-medium text-primary">Completed</span>
      </div>
    )
  }

  return (
    <Button
      onClick={handleMarkDone}
      disabled={isLoading}
      variant="default"
      size="sm"
      className="gap-2"
    >
      {isLoading ? 'Marking...' : 'Mark Done'}
    </Button>
  )
}
