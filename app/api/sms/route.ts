import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// SMS sending function - uses Twilio if configured, otherwise logs to console
async function sendSMS(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    // Log to console if Twilio not configured
    console.log(`[SMS] To: ${to} | Message: ${message}`)
    return { success: true, method: 'console', message: 'SMS logged (Twilio not configured)' }
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    const data = await response.json()
    return { success: true, method: 'twilio', sid: data.sid }
  } catch (error) {
    console.error('[SMS] Error sending:', error)
    return { success: false, error: String(error) }
  }
}

// Message templates
const templates = {
  job_scheduled: (name: string, date: string, service: string) =>
    `Hi ${name}! Your ${service} job has been scheduled for ${date}. We'll see you then! - Bear Hub Pro`,
  
  job_reminder: (name: string, date: string, service: string) =>
    `Reminder: Your ${service} appointment is tomorrow (${date}). Please ensure access to the work area. - Bear Hub Pro`,
  
  job_started: (name: string, service: string) =>
    `Hi ${name}! Our crew has arrived and started work on your ${service} job. - Bear Hub Pro`,
  
  job_completed: (name: string, service: string, amount: number) =>
    `Hi ${name}! Your ${service} job has been completed. Total: $${amount}. View your invoice at our customer portal. Thank you! - Bear Hub Pro`,
  
  quote_ready: (name: string, service: string, amount: number) =>
    `Hi ${name}! Your quote for ${service} is ready: $${amount}. Reply YES to approve or call us to discuss. - Bear Hub Pro`,
  
  payment_reminder: (name: string, amount: number) =>
    `Hi ${name}! Friendly reminder: You have an outstanding balance of $${amount}. Pay online at our customer portal. - Bear Hub Pro`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, jobId, customerId, phone, customMessage } = body

    const supabase = await createClient()

    // Get customer and job details
    let customer = null
    let job = null

    if (customerId) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()
      customer = data
    }

    if (jobId) {
      const { data } = await supabase
        .from('jobs')
        .select('*, customer:customers(*)')
        .eq('id', jobId)
        .single()
      job = data
      if (!customer && job?.customer) {
        customer = job.customer
      }
    }

    const targetPhone = phone || customer?.phone
    if (!targetPhone) {
      return NextResponse.json({ error: 'No phone number provided' }, { status: 400 })
    }

    // Generate message based on type
    let message = customMessage
    if (!message && type && job && customer) {
      const name = customer.name?.split(' ')[0] || 'Customer'
      const service = job.service_type || 'service'
      const amount = Number(job.actual_amount || job.estimated_amount || 0)
      const date = job.scheduled_date 
        ? new Date(job.scheduled_date).toLocaleDateString()
        : 'soon'

      switch (type) {
        case 'job_scheduled':
          message = templates.job_scheduled(name, date, service)
          break
        case 'job_reminder':
          message = templates.job_reminder(name, date, service)
          break
        case 'job_started':
          message = templates.job_started(name, service)
          break
        case 'job_completed':
          message = templates.job_completed(name, service, amount)
          break
        case 'quote_ready':
          message = templates.quote_ready(name, service, amount)
          break
        case 'payment_reminder':
          message = templates.payment_reminder(name, amount)
          break
        default:
          return NextResponse.json({ error: 'Invalid message type' }, { status: 400 })
      }
    }

    if (!message) {
      return NextResponse.json({ error: 'No message content' }, { status: 400 })
    }

    // Send the SMS
    const result = await sendSMS(targetPhone, message)

    // Log the notification
    await supabase.from('sms_log').insert({
      job_id: jobId,
      customer_id: customerId,
      phone: targetPhone,
      message,
      type,
      status: result.success ? 'sent' : 'failed',
      error: result.success ? null : result.error,
    }).catch(() => {
      // Table might not exist yet - that's ok
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[SMS API] Error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}

export async function GET() {
  // Return SMS templates and configuration status
  const configured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  
  return NextResponse.json({
    configured,
    templates: Object.keys(templates),
    message: configured 
      ? 'Twilio is configured and ready to send SMS'
      : 'SMS will be logged to console (configure TWILIO_* env vars to send real SMS)',
  })
}
