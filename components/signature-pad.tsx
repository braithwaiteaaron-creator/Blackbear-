'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleClear = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dataUrl = canvas.toDataURL()
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `signature-${Date.now()}.png`
    link.click()
  }

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current
    if (!canvas) return true
    const ctx = canvas.getContext('2d')
    if (!ctx) return true
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return imageData.data.every((val) => val === 0)
  }

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name')
      return
    }

    if (isCanvasEmpty()) {
      toast.error('Please sign the document')
      return
    }

    setIsLoading(true)
    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas not found')
      
      const signatureData = canvas.toDataURL()

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
      handleClear()
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
        <div className="space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Customer Name</label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email (Optional)</label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="john@example.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg bg-muted/30 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            className="w-full h-48 bg-white cursor-crosshair block"
            onMouseDown={(e) => {
              const canvas = canvasRef.current
              if (!canvas) return
              const ctx = canvas.getContext('2d')
              if (!ctx) return
              const rect = canvas.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              ctx.beginPath()
              ctx.moveTo(x, y)
              
              const handleMouseMove = (moveE: MouseEvent) => {
                const moveX = moveE.clientX - rect.left
                const moveY = moveE.clientY - rect.top
                ctx.lineTo(moveX, moveY)
                ctx.stroke()
              }
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }
              
              ctx.lineWidth = 2
              ctx.lineCap = 'round'
              ctx.lineJoin = 'round'
              ctx.strokeStyle = '#000'
              
              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
          />
        </div>

        <p className="text-sm text-muted-foreground">Sign above to approve this quote</p>

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
