'use client'

import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { toast } from 'sonner'
import { Trash2, Download } from 'lucide-react'

interface SignaturePadProps {
  quoteId: string
  onSignatureComplete?: () => void
}

export function SignaturePad({ quoteId, onSignatureComplete }: SignaturePadProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const signatureCanvasRef = useRef<SignatureCanvas>(null)

  const handleClear = () => {
    signatureCanvasRef.current?.clear()
  }

  const handleDownload = () => {
    const dataUrl = signatureCanvasRef.current?.toDataURL()
    if (!dataUrl) return

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `signature-${Date.now()}.png`
    link.click()
  }

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name')
      return
    }

    const isEmpty = signatureCanvasRef.current?.isEmpty()
    if (isEmpty) {
      toast.error('Please sign the document')
      return
    }

    setIsLoading(true)
    try {
      const signatureData = signatureCanvasRef.current?.toDataURL()

      const response = await fetch(`/api/quotes/${quoteId}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature_data: signatureData,
          customer_name: customerName,
          customer_email: customerEmail,
        }),
      })

      if (!response.ok) throw new Error('Failed to save signature')

      toast.success('Quote signed successfully!')
      setCustomerName('')
      setCustomerEmail('')
      signatureCanvasRef.current?.clear()
      onSignatureComplete?.()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error saving signature'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Customer Signature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Customer Name</FieldLabel>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email (Optional)</FieldLabel>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="john@example.com"
              disabled={isLoading}
            />
          </Field>
        </FieldGroup>

        <div className="border-2 border-dashed border-border rounded-lg bg-muted/30 overflow-hidden">
          <SignatureCanvas
            ref={signatureCanvasRef}
            canvasProps={{
              className: 'w-full h-48 bg-white cursor-crosshair',
              width: 500,
              height: 200,
            }}
          />
        </div>

        <FieldDescription>Sign above to approve this quote</FieldDescription>

        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isLoading}
          >
            <Trash2 className="size-4 mr-1" />
            Clear
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="size-4 mr-1" />
            Download
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading ? 'Saving...' : 'Submit Signature'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
