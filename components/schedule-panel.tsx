"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, DollarSign, Phone, Navigation, CheckCircle, Loader2 } from "lucide-react"
import { useJobs, type Job } from "@/lib/supabase/hooks"
import { toast } from "sonner"

export function SchedulePanel() {
  const { jobs, loading, updateJob } = useJobs()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [completingJob, setCompletingJob] = useState<string | null>(null)

  const handleCall = (job: Job) => {
    const phoneMatch = job.notes?.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)
    if (phoneMatch) {
      window.location.href = `tel:${phoneMatch[0]}`
    } else {
      toast.info("No phone number found. Add phone to job notes.")
    }
  }

  const handleDirections = (job: Job) => {
    const encodedAddress = encodeURIComponent(job.address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank")
  }

  const handleComplete = async (job: Job) => {
    setCompletingJob(job.id)
    const { error } = await updateJob(job.id, { status: "completed" })
    setCompletingJob(null)
    if (error) {
      toast.error("Failed to complete job")
    } else {
      toast.success(`${job.address} marked as completed!`)
    }
  }

  const handleFollowUp = (job: Job) => {
    const phoneMatch = job.notes?.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)
    if (phoneMatch) {
      window.location.href = `tel:${phoneMatch[0]}`
      toast.info(`Calling ${job.customer_name}...`)
    } else {
      toast.info("No phone found. Consider adding phone to the job notes.")
    }
  }

  const handleScheduleJob = async (job: Job) => {
    const { error } = await updateJob(job.id, { status: "scheduled" })
    if (error) {
      toast.error("Failed to schedule job")
    } else {
      toast.success(`${job.address} scheduled!`)
    }
  }

  // Group scheduled jobs by date
  const jobsByDate = new Map<string, any[]>()
  const scheduledJobs = jobs.filter((j) => j.status === "scheduled" || j.status === "in-progress")
  
  scheduledJobs.forEach((job) => {
    const dateStr = new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    if (!jobsByDate.has(dateStr)) {
      jobsByDate.set(dateStr, [])
    }
    jobsByDate.get(dateStr)?.push(job)
  })

  // Get unique dates sorted
  const upcomingDates = Array.from(jobsByDate.keys()).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA.getTime() - dateB.getTime()
  })

  const jobsForSelectedDate = selectedDate 
    ? jobsByDate.get(selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })) || []
    : upcomingDates.length > 0 
    ? jobsByDate.get(upcomingDates[0]) || []
    : []

  const quotesPendingFollowUp = jobs.filter((j) => j.status === "quote")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">View scheduled jobs and follow-ups</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled This Week</p>
                <p className="text-3xl font-bold">{scheduledJobs.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quotes Need Follow-up</p>
                <p className="text-3xl font-bold">{quotesPendingFollowUp.length}</p>
              </div>
              <Badge variant="destructive">{quotesPendingFollowUp.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Sidebar */}
        <div>
          <h3 className="font-semibold mb-4">Upcoming Dates</h3>
          <div className="space-y-2">
            {upcomingDates.length === 0 && (
              <p className="text-sm text-muted-foreground">No scheduled jobs</p>
            )}
            {upcomingDates.map((dateStr) => {
              const count = jobsByDate.get(dateStr)?.length || 0
              return (
                <Button
                  key={dateStr}
                  variant="outline"
                  className="w-full justify-between text-left"
                  onClick={() => {
                    const [month, day] = dateStr.split(" ")
                    const date = new Date(2025, new Date(`${month} 1`).getMonth(), parseInt(day))
                    setSelectedDate(date)
                  }}
                >
                  <span>{dateStr}</span>
                  <Badge variant="secondary">{count}</Badge>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Jobs for Selected Date */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold mb-4">
            {selectedDate 
              ? `${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`
              : upcomingDates.length > 0
              ? upcomingDates[0]
              : "No jobs scheduled"
            }
          </h3>
          
          <div className="space-y-3">
            {jobsForSelectedDate.length === 0 && (
              <Card className="bg-secondary/30">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No jobs scheduled for this date</p>
                </CardContent>
              </Card>
            )}

            {jobsForSelectedDate.map((job, index) => (
              <Card key={job.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{job.address}</h4>
                          <p className="text-sm text-muted-foreground">{job.job_type}</p>
                        </div>
                        <Badge variant={job.status === "in-progress" ? "default" : "secondary"}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-4 w-4" />
                          {job.customer_name}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          ${Number(job.value).toLocaleString()}
                        </div>
                      </div>
                      {job.notes && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{job.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t pt-3">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCall(job)}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDirections(job)}>
                      <Navigation className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => handleComplete(job)}
                      disabled={completingJob === job.id}
                    >
                      {completingJob === job.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quotes Pending Follow-up */}
      {quotesPendingFollowUp.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Quotes Pending Follow-up ({quotesPendingFollowUp.length})</h3>
          <div className="space-y-3">
            {quotesPendingFollowUp.slice(0, 5).map((job) => (
              <Card key={job.id} className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{job.customer_name}</h4>
                      <p className="text-sm text-muted-foreground">{job.address}</p>
                      <p className="text-sm text-muted-foreground">Quote: ${Number(job.value).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleFollowUp(job)}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" onClick={() => handleScheduleJob(job)}>
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
