import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  try {
    // Fetch job data
    const { data: job } = await supabase
      .from('jobs')
      .select('*, customer:customers(*)')
      .eq('id', params.jobId)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Fetch payment allocation
    const { data: allocation } = await supabase
      .from('payment_allocations')
      .select('*')
      .eq('job_id', params.jobId)
      .single()

    const amount = job.actual_amount || job.estimated_amount || 0
    const labour = allocation?.labour_cost || (amount * 0.45)
    const materials = allocation?.material_cost || (amount * 0.20)
    const overhead = allocation?.overhead_cost || (amount * 0.15)
    const tax = allocation?.tax_cost || (amount * 0.13)
    const profit = allocation?.profit || (amount * 0.07)

    // Generate simple HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${job.job_number}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .invoice { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header h1 { margin: 0; font-size: 32px; }
          .header p { margin: 5px 0; color: #666; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
          .detail-group { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .detail-label { font-weight: bold; color: #666; font-size: 12px; }
          .detail-value { font-size: 14px; margin-top: 5px; }
          .line-items { width: 100%; margin-bottom: 40px; border-collapse: collapse; }
          .line-items th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #000; }
          .line-items td { padding: 12px; border-bottom: 1px solid #ddd; }
          .line-items tr:last-child td { border-bottom: 2px solid #000; }
          .amount-right { text-align: right; }
          .summary { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
          .summary-items { }
          .summary-line { display: grid; grid-template-columns: 1fr 150px; gap: 20px; margin-bottom: 8px; padding-bottom: 8px; }
          .summary-line.total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 8px; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>INVOICE</h1>
            <p>Black Bear Services</p>
            <p>${job.job_number}</p>
          </div>

          <div class="details">
            <div class="detail-group">
              <div class="detail-label">BILL TO:</div>
              <div class="detail-value">${job.customer?.name || 'N/A'}</div>
              <div class="detail-value">${job.customer?.address || ''}</div>
              <div class="detail-value">${job.customer?.phone || ''}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">JOB DETAILS:</div>
              <div class="detail-value"><strong>Service:</strong> ${job.service_type}</div>
              <div class="detail-value"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
              <div class="detail-value"><strong>Status:</strong> ${job.status}</div>
            </div>
          </div>

          <table class="line-items">
            <thead>
              <tr>
                <th>Description</th>
                <th class="amount-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${job.service_type} - ${job.description}</td>
                <td class="amount-right"><strong>$${amount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-items">
              <div class="summary-line">
                <span>Labour (45%)</span>
                <span class="amount-right">$${labour.toFixed(2)}</span>
              </div>
              <div class="summary-line">
                <span>Materials (20%)</span>
                <span class="amount-right">$${materials.toFixed(2)}</span>
              </div>
              <div class="summary-line">
                <span>Overhead (15%)</span>
                <span class="amount-right">$${overhead.toFixed(2)}</span>
              </div>
              <div class="summary-line">
                <span>Tax (13%)</span>
                <span class="amount-right">$${tax.toFixed(2)}</span>
              </div>
              <div class="summary-line">
                <span>Profit (7%)</span>
                <span class="amount-right">$${profit.toFixed(2)}</span>
              </div>
              <div class="summary-line total">
                <span>TOTAL DUE</span>
                <span class="amount-right">$${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Black Bear Services - Professional Tree & Yard Services</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Return HTML that can be printed/converted to PDF
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${job.job_number}.html"`,
      },
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
