'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mail, Loader2, CheckCircle } from 'lucide-react'

interface SendQuoteButtonProps {
  quoteId: string
  customerEmail?: string
  disabled?: boolean
}

export function SendQuoteButton({ quoteId, customerEmail, disabled }: SendQuoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSend = async () => {
    if (!customerEmail) {
      toast.error('Customer email not found')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/quotes/${quoteId}/send-email`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      if (data.method === 'mailto') {
        // Open mailto link as fallback
        window.location.href = data.mailto
        toast.success('Opening email client...')
      } else {
        toast.success('Quote emailed successfully!')
        setIsSent(true)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error sending email'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <Button disabled className="bg-emerald-600 hover:bg-emerald-600">
        <CheckCircle className="size-4 mr-2" />
        Quote Sent
      </Button>
    )
  }

  return (
    <Button
      onClick={handleSend}
      disabled={disabled || isLoading || !customerEmail}
      className="bg-primary hover:bg-primary/90"
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 mr-2 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="size-4 mr-2" />
          Email Quote (50% Deposit)
        </>
      )}
    </Button>
  )
}
