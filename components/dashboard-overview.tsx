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
  AlertTriangle,
  ArrowRight,
  Camera,
  Zap,
  Mountain,
  Shield,
  QrCode,
} from "lucide-react"
import Image from "next/image"
import { QRCodeCard } from "./qr-code-card"

interface DashboardOverviewProps {
  onNavigate: (view: ActiveView) => void
}

const stats = [
  { label: "Active Jobs", value: "0", change: "Add your first job", icon: TreeDeciduous, color: "text-primary" },
  { label: "Revenue MTD", value: "$0", change: "No revenue yet", icon: DollarSign, color: "text-accent" },
  { label: "Active Leads", value: "0", change: "No leads yet", icon: Users, color: "text-chart-2" },
  { label: "Routes Today", value: "0", change: "No routes planned", icon: MapPin, color: "text-chart-5" },
]

const recentJobs: { id: number; address: string; type: string; status: string; value: string; permit: boolean; featured?: boolean }[] = []

const upcomingTasks: { time: string; task: string; type: string }[] = []

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
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
              {recentJobs.length === 0 ? (
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
                      job.status === "Featured"
                        ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30"
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
                          <span>{job.type}</span>
                          {job.permit && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Permit Needed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-accent">{job.value}</span>
                      <Badge variant={job.status === "Urgent" ? "destructive" : job.status === "In Progress" ? "default" : "secondary"}>
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
              {upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-6 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks scheduled today</p>
                </div>
              ) : (
                upcomingTasks.map((item, index) => (
                  <div key={index} className="flex gap-3 rounded-lg bg-secondary/50 p-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                    <div className="flex-1">
                      <p className="text-sm">{item.task}</p>
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
            <Button variant="secondary" className="h-auto flex-col gap-2 p-4" onClick={() => onNavigate("routes")}>
              <MapPin className="h-6 w-6 text-chart-2" />
              <span>Plan Route</span>
            </Button>
            <Button variant="secondary" className="h-auto flex-col gap-2 p-4">
              <Camera className="h-6 w-6 text-accent" />
              <span>Spot Damage</span>
            </Button>
            <Button variant="secondary" className="h-auto flex-col gap-2 p-4" onClick={() => onNavigate("routes")}>
              <Zap className="h-6 w-6 text-destructive" />
              <span>Storm Chase</span>
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
