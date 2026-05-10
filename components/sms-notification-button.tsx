'use client'

import { useState } from 'react'
import { MessageSquare, Loader2, Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SMSNotificationButtonProps {
  customerName: string
  customerPhone?: string
  jobNumber: string
  type?: 'job' | 'quote'
  onSuccess?: () => void
}

const messageTemplates = {
  onMyWay: (name: string) => `Hi ${name}, this is Black Bear Tree Care. We're on our way to your property now. See you soon!`,
  starting: (name: string) => `Hi ${name}, Black Bear Tree Care here. We're starting work on your property now. We'll let you know when we're done.`,
  completed: (name: string) => `Hi ${name}, Black Bear Tree Care has completed the work on your property. Thank you for your business!`,
  reminder: (name: string) => `Hi ${name}, this is a reminder from Black Bear Tree Care about your upcoming tree service. Please call us if you have any questions.`,
  quoteReady: (name: string) => `Hi ${name}, your quote from Black Bear Tree Care is ready. Please check your email or call us to discuss.`,
}

export function SMSNotificationButton({ 
  customerName, 
  customerPhone, 
  jobNumber,
  type = 'job',
  onSuccess 
}: SMSNotificationButtonProps) {
  const [sending, setSending] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)

  const sendSMS = async (templateKey: keyof typeof messageTemplates) => {
    if (!customerPhone) {
      alert('No phone number on file for this customer')
      return
    }

    setSending(templateKey)
    try {
      const message = messageTemplates[templateKey](customerName.split(' ')[0])
      
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerPhone,
          message,
          jobNumber,
        }),
      })

      if (!response.ok) throw new Error('Failed to send SMS')
      
      setSent(templateKey)
      setTimeout(() => setSent(null), 3000)
      onSuccess?.()
    } catch (error) {
      console.error('SMS error:', error)
      alert('Failed to send SMS. Please check SMS settings.')
    } finally {
      setSending(null)
    }
  }

  const firstName = customerName.split(' ')[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="size-4" />
          Text
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <DropdownMenuItem 
          onClick={() => sendSMS('onMyWay')}
          disabled={!!sending}
          className="cursor-pointer"
        >
          {sending === 'onMyWay' ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : sent === 'onMyWay' ? (
            <Check className="size-4 mr-2 text-green-500" />
          ) : (
            <Send className="size-4 mr-2" />
          )}
          "On my way"
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => sendSMS('starting')}
          disabled={!!sending}
          className="cursor-pointer"
        >
          {sending === 'starting' ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : sent === 'starting' ? (
            <Check className="size-4 mr-2 text-green-500" />
          ) : (
            <Send className="size-4 mr-2" />
          )}
          "Starting work now"
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => sendSMS('completed')}
          disabled={!!sending}
          className="cursor-pointer"
        >
          {sending === 'completed' ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : sent === 'completed' ? (
            <Check className="size-4 mr-2 text-green-500" />
          ) : (
            <Send className="size-4 mr-2" />
          )}
          "Job completed"
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => sendSMS('reminder')}
          disabled={!!sending}
          className="cursor-pointer"
        >
          {sending === 'reminder' ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : sent === 'reminder' ? (
            <Check className="size-4 mr-2 text-green-500" />
          ) : (
            <Send className="size-4 mr-2" />
          )}
          "Appointment reminder"
        </DropdownMenuItem>

        {type === 'quote' && (
          <DropdownMenuItem 
            onClick={() => sendSMS('quoteReady')}
            disabled={!!sending}
            className="cursor-pointer"
          >
            {sending === 'quoteReady' ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : sent === 'quoteReady' ? (
              <Check className="size-4 mr-2 text-green-500" />
            ) : (
              <Send className="size-4 mr-2" />
            )}
            "Quote ready"
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
