import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// This endpoint checks all scheduled jobs and sends reminders as needed
// Should be called by a cron job daily (e.g., via Vercel Cron)

export async function GET() {
  try {
    const supabase = await createClient()
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    
    // Calculate date ranges
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    const threeDaysDate = threeDaysFromNow.toISOString().split("T")[0]

    const oneDayFromNow = new Date(now)
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)
    const oneDayDate = oneDayFromNow.toISOString().split("T")[0]

    const results = {
      checked: 0,
      reminders_sent: {
        "3day": 0,
        "1day": 0,
        "morning": 0,
      },
      errors: [] as string[],
    }

    // Get all scheduled jobs with customer contact info
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "scheduled")
      .not("scheduled_date", "is", null)
      .or("customer_phone.not.is.null,customer_email.not.is.null")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    results.checked = jobs?.length || 0

    for (const job of jobs || []) {
      const jobDate = job.scheduled_date?.split("T")[0]
      
      // Check 3-day reminder
      if (jobDate === threeDaysDate && !job.reminder_3day_sent) {
        try {
          await sendReminder(job.id, "3day")
          results.reminders_sent["3day"]++
        } catch (e) {
          results.errors.push(`3day reminder failed for job ${job.id}`)
        }
      }

      // Check 1-day reminder
      if (jobDate === oneDayDate && !job.reminder_1day_sent) {
        try {
          await sendReminder(job.id, "1day")
          results.reminders_sent["1day"]++
        } catch (e) {
          results.errors.push(`1day reminder failed for job ${job.id}`)
        }
      }

      // Check morning-of reminder (only before 10am)
      if (jobDate === today && !job.reminder_morning_sent && now.getHours() < 10) {
        try {
          await sendReminder(job.id, "morning")
          results.reminders_sent["morning"]++
        } catch (e) {
          results.errors.push(`morning reminder failed for job ${job.id}`)
        }
      }
    }

    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    console.error("Reminder check error:", error)
    return NextResponse.json({ error: "Reminder check failed" }, { status: 500 })
  }
}

async function sendReminder(jobId: string, reminderType: "3day" | "1day" | "morning") {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000"
    
  const response = await fetch(`${baseUrl}/api/reminders/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId, reminderType }),
  })
  
  if (!response.ok) {
    throw new Error("Failed to send reminder")
  }
  
  return response.json()
}
