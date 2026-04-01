'use client'

import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface QRCodeCardProps {
  value: string
  title: string
  description?: string
  size?: number
}

export function QRCodeCard({
  value,
  title,
  description,
  size = 200,
}: QRCodeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const qrCodeRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    qrCodeRef.current = new QRCodeStyling({
      width: size,
      height: size,
      type: 'canvas',
      data: value,
      image: '',
      dotsOptions: {
        color: '#000000',
        type: 'rounded',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      cornersSquareOptions: {
        type: 'square',
        color: '#000000',
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'square',
      },
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
    })

    containerRef.current.innerHTML = ''
    qrCodeRef.current.append(containerRef.current)
  }, [value, size])

  const downloadQR = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.download({ name: `${title.replace(/\s+/g, '-')}-qr`, extension: 'png' })
      toast.success('QR code downloaded!')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value)
    toast.success('Link copied to clipboard!')
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="rounded-lg border border-border p-4 bg-white">
          <div ref={containerRef} />
        </div>
        <p className="text-xs text-center text-muted-foreground break-all max-w-[250px]">
          {value}
        </p>
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            variant="outline"
            onClick={downloadQR}
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="flex-1 gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
