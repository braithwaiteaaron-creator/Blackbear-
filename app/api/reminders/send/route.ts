import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Twilio SMS
async function sendSMS(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Twilio credentials not configured")
    return { success: false, error: "Twilio not configured" }
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    )

    const data = await response.json()
    if (data.sid) {
      return { success: true, sid: data.sid }
    } else {
      return { success: false, error: data.message || "SMS failed" }
    }
  } catch (error) {
    console.error("SMS error:", error)
    return { success: false, error: "SMS send failed" }
  }
}

// SendGrid Email
async function sendEmail(to: string, subject: string, htmlContent: string) {
  const apiKey = process.env.SENDGRID_API_KEY

  if (!apiKey) {
    console.error("SendGrid API key not configured")
    return { success: false, error: "SendGrid not configured" }
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "blackbeartrees27@gmail.com", name: "Black Bear Tree Care" },
        subject,
        content: [{ type: "text/html", value: htmlContent }],
      }),
    })

    if (response.ok || response.status === 202) {
      return { success: true }
    } else {
      const error = await response.text()
      return { success: false, error }
    }
  } catch (error) {
    console.error("Email error:", error)
    return { success: false, error: "Email send failed" }
  }
}

// Generate reminder message
function generateReminderMessage(job: any, reminderType: "3day" | "1day" | "morning") {
  const scheduledDate = new Date(job.scheduled_date)
  const dateStr = scheduledDate.toLocaleDateString("en-CA", { 
    weekday: "long", 
    month: "long", 
    day: "numeric" 
  })
  const timeStr = job.time_started_at 
    ? new Date(job.time_started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "TBD"

  const messages = {
    "3day": {
      sms: `Hi! This is Black Bear Tree Care. Just a reminder that your ${job.service_type} service at ${job.address} is scheduled for ${dateStr} at ${timeStr}. Reply STOP to unsubscribe.`,
      subject: `Reminder: Your Tree Service Appointment in 3 Days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5016;">Black Bear Tree Care - Appointment Reminder</h2>
          <p>Hi there!</p>
          <p>This is a friendly reminder that your <strong>${job.service_type}</strong> service is coming up in 3 days.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Service:</strong> ${job.service_type}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.address}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${dateStr}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${timeStr}</p>
          </div>
          <p>If you need to reschedule, please call us at <a href="tel:647-764-9017">647-764-9017</a>.</p>
          <p>Thank you for choosing Black Bear Tree Care!</p>
          <p style="color: #666; font-size: 12px;">We Climb Where Others Can't</p>
        </div>
      `,
    },
    "1day": {
      sms: `Black Bear Tree Care reminder: Your ${job.service_type} at ${job.address} is TOMORROW, ${dateStr} at ${timeStr}. See you soon! Call 647-764-9017 with questions.`,
      subject: `Tomorrow: Your Tree Service Appointment`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5016;">Your Appointment is Tomorrow!</h2>
          <p>Hi there!</p>
          <p>Just a quick reminder that we'll be at your property <strong>tomorrow</strong> for your scheduled tree service.</p>
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d5016;">
            <p style="margin: 5px 0;"><strong>Service:</strong> ${job.service_type}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.address}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${dateStr}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${timeStr}</p>
          </div>
          <p><strong>Please ensure:</strong></p>
          <ul>
            <li>Clear access to the work area</li>
            <li>Vehicles are moved if needed</li>
            <li>Pets are secured</li>
          </ul>
          <p>Questions? Call us at <a href="tel:647-764-9017">647-764-9017</a>.</p>
          <p>See you tomorrow!</p>
          <p style="color: #2d5016; font-weight: bold;">Black Bear Tree Care</p>
        </div>
      `,
    },
    "morning": {
      sms: `Good morning! Black Bear Tree Care here. We're scheduled to arrive at ${job.address} today at ${timeStr} for your ${job.service_type}. See you soon!`,
      subject: `Today: Black Bear Tree Care Arriving Soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5016;">We're Coming Today!</h2>
          <p>Good morning!</p>
          <p>This is a reminder that Black Bear Tree Care is scheduled to arrive at your property <strong>today</strong>.</p>
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <p style="margin: 5px 0; font-size: 18px;"><strong>Arriving at: ${timeStr}</strong></p>
            <p style="margin: 5px 0;"><strong>Service:</strong> ${job.service_type}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.address}</p>
          </div>
          <p>We'll give you a call when we're on our way!</p>
          <p>Thank you for your business.</p>
          <p style="color: #2d5016; font-weight: bold;">Black Bear Tree Care<br/>647-764-9017</p>
        </div>
      `,
    },
  }

  return messages[reminderType]
}

export async function POST(request: Request) {
  try {
    const { jobId, reminderType } = await request.json()

    const supabase = await createClient()
    
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const message = generateReminderMessage(job, reminderType)
    const results = { sms: null as any, email: null as any }

    // Send SMS if phone exists
    if (job.customer_phone) {
      results.sms = await sendSMS(job.customer_phone, message.sms)
    }

    // Send Email if email exists
    if (job.customer_email) {
      results.email = await sendEmail(job.customer_email, message.subject, message.html)
    }

    // Update reminder sent flag
    const updateField = {
      "3day": "reminder_3day_sent",
      "1day": "reminder_1day_sent",
      "morning": "reminder_morning_sent",
    }[reminderType]

    await supabase
      .from("jobs")
      .update({ [updateField]: true })
      .eq("id", jobId)

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Reminder error:", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
