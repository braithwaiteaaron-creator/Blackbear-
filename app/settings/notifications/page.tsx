import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'SMS Notifications - Bear Hub Pro',
  description: 'Manage SMS notification settings',
}

async function sendTestSMS(formData: FormData) {
  'use server'
  const phone = formData.get('phone') as string
  const message = formData.get('message') as string

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, customMessage: message }),
  })

  revalidatePath('/settings/notifications')
}

async function sendJobNotification(formData: FormData) {
  'use server'
  const jobId = formData.get('jobId') as string
  const type = formData.get('type') as string

  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, type }),
  })

  redirect(`/jobs/${jobId}?sms_sent=true`)
}

export default async function NotificationSettingsPage() {
  const supabase = await createClient()
  
  // Check Twilio configuration
  const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)

  // Get recent jobs for quick notifications
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*, customer:customers(name, phone)')
    .order('created_at', { ascending: false })
    .limit(5)

  const messageTypes = [
    { id: 'job_scheduled', label: 'Job Scheduled', description: 'Notify customer their job has been scheduled' },
    { id: 'job_reminder', label: 'Appointment Reminder', description: 'Remind customer of upcoming appointment' },
    { id: 'job_started', label: 'Job Started', description: 'Notify customer crew has arrived' },
    { id: 'job_completed', label: 'Job Completed', description: 'Notify customer job is done with total' },
    { id: 'quote_ready', label: 'Quote Ready', description: 'Send quote to customer for approval' },
    { id: 'payment_reminder', label: 'Payment Reminder', description: 'Remind customer of outstanding balance' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            <h1 className="text-xl font-bold">SMS Notifications</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Status Card */}
        <Card className={twilioConfigured ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}>
          <CardContent className="p-6 flex items-center gap-4">
            {twilioConfigured ? (
              <>
                <CheckCircle className="size-8 text-emerald-400" />
                <div>
                  <h2 className="font-semibold text-emerald-400">Twilio Connected</h2>
                  <p className="text-sm text-muted-foreground">SMS notifications are ready to send</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="size-8 text-amber-400" />
                <div>
                  <h2 className="font-semibold text-amber-400">Twilio Not Configured</h2>
                  <p className="text-sm text-muted-foreground">
                    Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your environment variables.
                    SMS will be logged to console until configured.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Send Test SMS */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="size-5" />
              Send Test SMS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={sendTestSMS} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="Enter your test message..."
                  className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-colors"
              >
                <Send className="size-4" />
                Send Test SMS
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Message Templates */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messageTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50">
                  <div>
                    <h4 className="font-medium">{type.label}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  <Badge variant="outline">{type.id}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Send to Recent Jobs */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Quick Send to Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recentJobs || recentJobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent jobs found</p>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job: any) => (
                  <div key={job.id} className="p-4 rounded-xl bg-background border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{job.service_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.customer?.name || 'No customer'} 
                          {job.customer?.phone && ` • ${job.customer.phone}`}
                        </p>
                      </div>
                      <Badge variant="outline">{job.status}</Badge>
                    </div>
                    {job.customer?.phone && (
                      <form action={sendJobNotification} className="flex gap-2">
                        <input type="hidden" name="jobId" value={job.id} />
                        <select
                          name="type"
                          required
                          className="flex-1 p-2 rounded-lg bg-background border border-border text-sm"
                        >
                          <option value="">Select notification type...</option>
                          {messageTypes.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                        >
                          Send
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
