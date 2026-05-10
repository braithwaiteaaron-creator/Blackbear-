import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Clock, ChevronRight, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Schedule & Route - Bear Hub Pro',
  description: 'Schedule jobs and optimize your route',
}

export default async function SchedulePage() {
  const supabase = await createClient()

  // Get jobs scheduled for this week
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .gte('scheduled_date', weekStart.toISOString().split('T')[0])
    .lte('scheduled_date', weekEnd.toISOString().split('T')[0])
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_date', { ascending: true })

  // Get route stops for optimization
  const { data: routeStops } = await supabase
    .from('route_stops')
    .select('*')
    .gte('route_date', weekStart.toISOString().split('T')[0])
    .lte('route_date', weekEnd.toISOString().split('T')[0])
    .order('route_date, priority', { ascending: true })

  // Group jobs by date
  const jobsByDate: Record<string, typeof jobs> = {}
  jobs?.forEach((job: any) => {
    const date = job.scheduled_date
    if (!jobsByDate[date]) jobsByDate[date] = []
    jobsByDate[date].push(job)
  })

  // Get route stops by date
  const routesByDate: Record<string, typeof routeStops> = {}
  routeStops?.forEach((stop: any) => {
    const date = stop.route_date
    if (!routesByDate[date]) routesByDate[date] = []
    routesByDate[date].push(stop)
  })

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-2xl font-bold">Weekly Schedule & Route</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            Week of {new Date(weekStart).toLocaleDateString()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Actions */}
        <div className="mb-6 flex gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <ChevronRight className="size-4 rotate-180" />
            Back to Dashboard
          </Link>
          <button
            type="button"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={true}
            title="Route optimization features will be enabled when jobs are scheduled"
          >
            <Zap className="size-5" />
            Optimize Routes (Beta)
          </button>
        </div>

        {/* Legend */}
        <div className="mb-6 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-blue-500" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-amber-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-emerald-500" />
            <span>Route Optimized</span>
          </div>
        </div>

        {/* Weekly View */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
          {days.map((date, dayIdx) => {
            const dateObj = new Date(date)
            const dayName = dayNames[dateObj.getDay()]
            const dayJobs = jobsByDate[date] || []
            const dayRoutes = routesByDate[date] || []

            return (
              <Card key={date} className="bg-card border-border/50 flex flex-col h-full min-h-96">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm">
                    <div className="font-bold text-base">{dayName}</div>
                    <div className="text-xs text-muted-foreground">{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {dayJobs.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No jobs scheduled</p>
                  ) : (
                    dayJobs.map((job: any) => (
                      <Link key={job.id} href={`/jobs/${job.id}`}>
                        <div className={`p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-xs ${
                          job.status === 'in_progress' 
                            ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                            : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                        }`}>
                          <div className="font-semibold truncate">{job.service_type}</div>
                          <div className="text-xs opacity-80 truncate">{job.address}</div>
                          {job.estimated_amount && (
                            <div className="text-xs opacity-70 mt-1">${Number(job.estimated_amount).toLocaleString()}</div>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                  
                  {/* Route Optimization Info */}
                  {dayRoutes.length > 0 && (
                    <div className="pt-2 border-t border-border/50 mt-2">
                      <div className="text-xs font-semibold text-emerald-400 mb-1">Route ({dayRoutes.length} stops)</div>
                      <div className="space-y-1">
                        {dayRoutes.map((route: any, idx: number) => (
                          <div key={route.id} className="text-xs bg-emerald-500/10 p-1 rounded border border-emerald-500/30">
                            <span className="font-bold text-emerald-400">Stop {idx + 1}:</span> {route.address}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Unscheduled Jobs */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="size-5" />
            Unscheduled Jobs Needing Dates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs && jobs.filter((j: any) => !j.scheduled_date).length === 0 ? (
              <Card className="bg-card border-border/50 p-6 text-center col-span-full">
                <p className="text-muted-foreground">All jobs are scheduled!</p>
              </Card>
            ) : (
              jobs?.filter((j: any) => !j.scheduled_date).map((job: any) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="bg-card border-border/50 hover:border-border transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{job.service_type}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="size-3" />
                            {job.address}
                          </p>
                          <p className="text-base font-bold text-primary mt-2">${Number(job.estimated_amount).toLocaleString()}</p>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Route Optimization Tips */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm">Route Optimization Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>• Click on a job to view details and assign it to a specific date</p>
            <p>• Jobs are listed by scheduled date across the week</p>
            <p>• Route stops show the optimized order for each day</p>
            <p>• Estimated times help you plan your daily route efficiently</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
