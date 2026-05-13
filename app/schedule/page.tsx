import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Clock, MapPin, ChevronRight, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const supabase = await createClient()

  // Fetch active and pending jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, address, service_type, status, created_at')
    .in('status', ['quote', 'in_progress', 'pending'])
    .order('created_at', { ascending: false })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const statusColors: Record<string, string> = {
    quote: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Exit Button */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          href="/"
          className="inline-flex items-center justify-center size-10 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
          title="Exit Schedule"
        >
          <X className="size-5 text-foreground" />
        </Link>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="p-4 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-6 text-primary" />
            <h1 className="text-2xl font-bold">Schedule</h1>
          </div>
          <p className="text-sm text-muted-foreground">{jobs?.length || 0} active jobs</p>
        </div>
      </div>

      {/* Job Schedule */}
      <div className="p-4 max-w-2xl space-y-2">
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No scheduled jobs</p>
          </div>
        ) : (
          jobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {job.address || 'Unknown Location'}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${
                        statusColors[job.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {job.status === 'in_progress' ? 'In Progress' : job.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 flex-shrink-0" />
                      <span>{job.service_type || 'Service'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 flex-shrink-0" />
                      <span>{formatDate(job.created_at)}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
