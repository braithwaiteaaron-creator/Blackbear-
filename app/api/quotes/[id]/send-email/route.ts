import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const supabase = await createClient()
    
    // Get quote with customer info
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*, customer:customers(*)')
      .eq('id', id)
      .single()
    
    if (error || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    
    const customer = quote.customer
    const customerEmail = customer?.email
    
    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email not found' }, { status: 400 })
    }
    
    // Calculate amounts
    const total = Number(quote.amount) || 0
    const deposit = Math.round(total * 0.5 * 100) / 100
    const balance = Math.round((total - deposit) * 100) / 100
    
    // Calculate breakdown (45/20/15/13/7)
    const labour = Math.round(total * 0.45 * 100) / 100
    const materials = Math.round(total * 0.20 * 100) / 100
    const overhead = Math.round(total * 0.15 * 100) / 100
    const tax = Math.round(total * 0.13 * 100) / 100
    const profit = Math.round(total * 0.07 * 100) / 100
    
    const quoteRef = `BHP-${id.slice(0, 8).toUpperCase()}`
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #171717; padding: 30px; border-radius: 0 0 12px 12px; }
    .total-box { background: #262626; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .total { font-size: 32px; font-weight: bold; color: #10b981; }
    .payment-box { background: #1a2e1a; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .payment-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333; }
    .payment-row:last-child { border-bottom: none; font-weight: bold; }
    .breakdown { background: #262626; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 4px 0; color: #a3a3a3; }
    .footer { text-align: center; padding: 20px; color: #737373; font-size: 12px; }
    .etransfer { background: #10b981; color: white; padding: 15px 25px; border-radius: 8px; display: inline-block; text-decoration: none; font-weight: bold; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bear Hub Pro</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Your Quote is Ready</p>
    </div>
    <div class="content">
      <p>Hi ${customer?.name || 'Valued Customer'},</p>
      <p>Your quote for <strong>${quote.service_type || 'Tree Service'}</strong> at <strong>${quote.address || 'your property'}</strong> is ready.</p>
      
      <div class="total-box">
        <div style="color: #a3a3a3; font-size: 14px;">TOTAL QUOTE</div>
        <div class="total">$${total.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
      </div>
      
      <div class="payment-box">
        <div style="font-weight: bold; margin-bottom: 15px; color: #22c55e;">PAYMENT SCHEDULE</div>
        <div class="payment-row">
          <span>50% Deposit (Due to Book)</span>
          <span style="color: #22c55e; font-weight: bold;">$${deposit.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="payment-row">
          <span>50% Balance (Due on Completion)</span>
          <span>$${balance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin: 25px 0;">
        <p style="margin-bottom: 10px;"><strong>Pay Deposit via E-Transfer:</strong></p>
        <p style="color: #10b981; font-size: 18px;">payments@bearhubpro.com</p>
        <p style="color: #a3a3a3; font-size: 14px;">Reference: ${quoteRef}</p>
      </div>
      
      <div class="breakdown">
        <div style="font-weight: bold; margin-bottom: 10px; color: #e5e5e5;">Service Breakdown</div>
        <div class="breakdown-row"><span>Labour (45%)</span><span>$${labour.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span></div>
        <div class="breakdown-row"><span>Materials (20%)</span><span>$${materials.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span></div>
        <div class="breakdown-row"><span>Overhead (15%)</span><span>$${overhead.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span></div>
        <div class="breakdown-row"><span>Tax (13%)</span><span>$${tax.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span></div>
        <div class="breakdown-row"><span>Profit (7%)</span><span>$${profit.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span></div>
      </div>
      
      ${quote.description ? `<p style="color: #a3a3a3;"><strong>Notes:</strong> ${quote.description}</p>` : ''}
      
      <p style="color: #a3a3a3; font-size: 14px;">Quote valid until: ${validUntil}</p>
      <p>Questions? Simply reply to this email.</p>
    </div>
    <div class="footer">
      <p>Sent via Bear Hub Pro</p>
    </div>
  </div>
</body>
</html>
    `
    
    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (resendApiKey) {
      const resend = new Resend(resendApiKey)
      
      const { error: sendError } = await resend.emails.send({
        from: 'Bear Hub Pro <quotes@bearhubpro.com>',
        to: customerEmail,
        subject: `Your Bear Hub Pro Quote - ${quote.service_type || 'Tree Service'} at ${quote.address || 'Your Property'}`,
        html: emailHtml,
      })
      
      if (sendError) {
        console.error('Resend error:', sendError)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }
      
      // Update quote status to 'sent'
      await supabase
        .from('quotes')
        .update({ status: 'sent' })
        .eq('id', id)
      
      return NextResponse.json({ success: true, method: 'resend' })
    } else {
      // Return data for mailto fallback
      const subject = encodeURIComponent(`Your Bear Hub Pro Quote - ${quote.service_type || 'Tree Service'}`)
      const body = encodeURIComponent(`Hi ${customer?.name || 'there'},

Your quote for ${quote.service_type || 'tree service'} at ${quote.address || 'your property'} is ready.

TOTAL: $${total.toLocaleString('en-CA', { minimumFractionDigits: 2 })}

PAYMENT SCHEDULE:
- 50% Deposit (Due to Book): $${deposit.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
- 50% Balance (Due on Completion): $${balance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}

PAY VIA E-TRANSFER:
Email: payments@bearhubpro.com
Reference: ${quoteRef}

Quote valid until: ${validUntil}

Questions? Reply to this email.

— Bear Hub Pro
`)
      
      return NextResponse.json({
        success: true,
        method: 'mailto',
        mailto: `mailto:${customerEmail}?subject=${subject}&body=${body}`,
        customerEmail,
      })
    }
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
