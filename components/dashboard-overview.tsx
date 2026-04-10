"use client"

import type { ActiveView } from "@/app/page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TreeDeciduous,
  DollarSign,
  Users,
  MapPin,
  TrendingUp,
  Clock,
  ArrowRight,
  Mountain,
  Shield,
  QrCode,
  Loader2,
  AlertCircle,
  Phone,
  CheckCircle,
} from "lucide-react"
import Image from "next/image"
import { QRCodeCard } from "./qr-code-card"
import { useJobs, useLeads, useTransactions, type Job } from "@/lib/supabase/hooks"
import { toast } from "sonner"

interface DashboardOverviewProps {
  onNavigate: (view: ActiveView) => void
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const { jobs, loading: jobsLoading, updateJob } = useJobs()
  const { leads, loading: leadsLoading } = useLeads()
  const { transactions, loading: transactionsLoading } = useTransactions()

  const handleCallJob = (job: Job) => {
    const phoneMatch = job.notes?.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)
    if (phoneMatch) {
      window.location.href = `tel:${phoneMatch[0]}`
      toast.info(`Calling ${job.customer_name}...`)
    } else {
      toast.info("No phone found. Add phone to job notes.")
    }
  }

  const handleMarkFollowedUp = async (job: Job) => {
    // Mark as scheduled to indicate follow-up done
    const { error } = await updateJob(job.id, { status: "scheduled" })
    if (error) {
      toast.error("Failed to update job")
    } else {
      toast.success(`${job.customer_name} marked as followed up!`)
    }
  }

  const activeJobs = jobs.filter(j => j.status !== "completed")
  const revenueMTD = transactions.filter(t => t.status === "completed").reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const activeLeads = leads.filter(l => l.status !== "converted" && l.status !== "lost")
  const recentJobs = jobs.slice(0, 5)

  // Follow-up tracking - quotes that need attention
  const now = new Date()
  const getJobAge = (job: typeof jobs[0]) => {
    const created = new Date(job.created_at)
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const needsFollowUp = jobs
    .filter(j => j.status === "quote")
    .map(j => ({ ...j, ageDays: getJobAge(j) }))
    .filter(j => j.ageDays >= 1) // Show quotes 1+ days old
    .sort((a, b) => b.ageDays - a.ageDays) // Oldest first (most urgent)

  const stats = [
    { label: "Active Jobs", value: activeJobs.length.toString(), change: activeJobs.length > 0 ? `${jobs.filter(j => j.status === "quote").length} quotes pending` : "Add your first job", icon: TreeDeciduous, color: "text-primary" },
    { label: "Revenue MTD", value: `$${revenueMTD.toLocaleString()}`, change: revenueMTD > 0 ? "From completed jobs" : "No revenue yet", icon: DollarSign, color: "text-accent" },
    { label: "Active Leads", value: activeLeads.length.toString(), change: activeLeads.length > 0 ? `${leads.filter(l => l.priority === "hot").length} hot leads` : "No leads yet", icon: Users, color: "text-chart-2" },
    { label: "Total Jobs", value: jobs.length.toString(), change: jobs.length > 0 ? "All time" : "No jobs yet", icon: MapPin, color: "text-chart-5" },
  ]

  const isLoading = jobsLoading || leadsLoading || transactionsLoading

  return (
    <div className="space-y-6">
      {/* USP Banner - We Climb Where Others Can't */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/30 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 md:p-6">
            <div className="relative shrink-0">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-primary/50">
                <Image
                  src="/images/owner-climbing.jpg"
                  alt="Black Bear Tree Care - Professional Climber"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
                <Mountain className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                We Climb Where Others Can&apos;t
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Specialized in inaccessible trees. Not all companies climb - they don&apos;t have the Black Bear.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <Badge variant="outline" className="bg-primary/10 border-primary/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Licensed & Insured
                </Badge>
                <Badge variant="outline" className="bg-accent/10 border-accent/30">
                  5.0 Stars on Yelp
                </Badge>
                <Badge variant="outline" className="bg-chart-2/10 border-chart-2/30">
                  Serving Toronto Since 2021
                </Badge>
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-2 shrink-0">
              <Button size="sm" className="gap-2" onClick={() => onNavigate("jobs")}>
                <TreeDeciduous className="h-4 w-4" />
                New Quote
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                24/7 Emergency
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Follow-Up Needed - Most Important Section */}
      {needsFollowUp.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-amber-600">Follow-Up Needed</CardTitle>
                <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                  {needsFollowUp.length} quotes waiting
                </Badge>
              </div>
            </div>
            <CardDescription>These quotes need a follow-up call</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {needsFollowUp.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    job.ageDays >= 4
                      ? "bg-destructive/20 border border-destructive/30"
                      : job.ageDays >= 2
                      ? "bg-amber-500/20 border border-amber-500/30"
                      : "bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      job.ageDays >= 4 ? "bg-destructive/30" : job.ageDays >= 2 ? "bg-amber-500/30" : "bg-primary/10"
                    }`}>
                      <span className="text-sm font-bold">{job.ageDays}d</span>
                    </div>
                    <div>
                      <p className="font-medium">{job.customer_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{job.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-accent">${Number(job.value).toLocaleString()}</span>
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleCallJob(job)}>
                      <Phone className="h-3 w-3" />
                      Call
                    </Button>
                    <Button size="sm" className="h-8 gap-1 bg-primary" onClick={() => handleMarkFollowedUp(job)}>
                      <CheckCircle className="h-3 w-3" />
                      Done
                    </Button>
                  </div>
                </div>
              ))}
              {needsFollowUp.length > 5 && (
                <p className="text-sm text-center text-muted-foreground pt-2">
                  +{needsFollowUp.length - 5} more quotes need follow-up
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Jobs */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Latest job activity and quotes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("jobs")}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-8 text-center">
                  <TreeDeciduous className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-muted-foreground">No jobs yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Head to Jobs & Quotes to add your first job</p>
                  <Button size="sm" className="mt-4" onClick={() => onNavigate("jobs")}>Add First Job</Button>
                </div>
              ) : (
                recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      job.status === "urgent"
                        ? "bg-gradient-to-r from-destructive/20 to-destructive/10 border border-destructive/30"
                        : "bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TreeDeciduous className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{job.address}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{job.job_type}</span>
                          {job.permit_required && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Permit Needed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-accent">${Number(job.value).toLocaleString()}</span>
                      <Badge variant={job.status === "urgent" ? "destructive" : job.status === "in-progress" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.filter(j => j.status === "scheduled").length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-6 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No jobs scheduled</p>
                  <p className="text-xs text-muted-foreground mt-1">Schedule a job to see it here</p>
                </div>
              ) : (
                jobs.filter(j => j.status === "scheduled").slice(0, 4).map((job) => (
                  <div key={job.id} className="flex gap-3 rounded-lg bg-secondary/50 p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{job.address}</p>
                      <p className="text-xs text-muted-foreground">{job.job_type} - {job.customer_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="secondary" className="h-auto flex-col gap-2 p-4" onClick={() => onNavigate("jobs")}>
              <TreeDeciduous className="h-6 w-6 text-primary" />
              <span>New Quote</span>
            </Button>
            <Button variant="secondary" className="h-auto flex-col gap-2 p-4" onClick={() => onNavigate("customers")}>
              <Users className="h-6 w-6 text-chart-2" />
              <span>Find Customer</span>
            </Button>
            <Button variant="secondary" className="h-auto flex-col gap-2 p-4" onClick={() => onNavigate("schedule")}>
              <Clock className="h-6 w-6 text-accent" />
              <span>View Schedule</span>
            </Button>
            <Button variant="secondary" className="h-auto flex-col gap-2 p-4" onClick={() => onNavigate("referrals")}>
              <QrCode className="h-6 w-6 text-primary" />
              <span>Referral Codes</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Shareable QR Codes</h2>
          <p className="text-xs text-muted-foreground ml-auto">Download or share for marketing</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QRCodeCard
            value="https://blackbeartreecare.com"
            title="Website"
            description="Direct link to Black Bear Tree Care"
            size={180}
          />
          <QRCodeCard
            value="tel:647-764-9017"
            title="24/7 Emergency Line"
            description="Call for emergency tree removal"
            size={180}
          />
          <QRCodeCard
            value="https://www.yelp.ca/biz/black-bear-tree-care"
            title="5-Star Yelp Reviews"
            description="Tap to see customer reviews"
            size={180}
          />
        </div>
      </div>
    </div>
  )
}
