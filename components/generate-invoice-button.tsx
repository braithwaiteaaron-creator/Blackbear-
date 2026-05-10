'use client'

import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF } from './invoice-pdf'

interface GenerateInvoiceButtonProps {
  job: {
    id: string
    job_number: string
    description?: string
    service_type: string
    estimated_amount: number
    actual_amount?: number
    customer?: {
      name: string
      address?: string
      city?: string
      phone?: string
      email?: string
    }
  }
  materials?: Array<{
    description: string
    quantity: number
    unit: string
    cost: number
  }>
}

export function GenerateInvoiceButton({ job, materials }: GenerateInvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateInvoice = async () => {
    setIsGenerating(true)
    try {
      const invoiceData = {
        invoiceNumber: `INV-${job.job_number}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        customer: {
          name: job.customer?.name || 'Customer',
          address: job.customer?.address,
          city: job.customer?.city,
          phone: job.customer?.phone,
          email: job.customer?.email,
        },
        job: {
          description: job.description || 'Tree service',
          serviceType: job.service_type,
          amount: job.actual_amount || job.estimated_amount,
        },
        materials: materials,
      }

      const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice-${job.job_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating invoice:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generateInvoice}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="size-4" />
          Invoice
        </>
      )}
    </Button>
  )
}
