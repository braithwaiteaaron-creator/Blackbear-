import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Briefcase, FileText, Users, TrendingUp, Plus,
  Wrench, ChevronRight, TreeDeciduous, UserPlus, DollarSign, AlertCircle, Calendar,
  CloudSun, Star, Settings
} from 'lucide-react'
import { RevenueGauge } from '@/components/revenue-gauge'

export const dynamic = 'force-dynamic'

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams
  const activeTab = params.tab || 'quotes'
  
  const supabase = await createClient()

  const [allJobsRes, jobsRes, quotesRes, customersRes] = await Promise.all([
    supabase.from('jobs').select('status, paid, actual_amount, estimated_amount'),
    supabase.from('jobs').select('*, customer:customers(*)').order('created_at', { ascending: false }).limit(50),
    supabase.from('quotes').select('*, customer:customers(*)').order('created_at', { ascending: false }).limit(20),
    supabase.from('customers').select('*').limit(100),
  ])

  const allJobs = allJobsRes.data || []
  const jobs = jobsRes.data || []
  const quotes = quotesRes.data || []
  const customers = customersRes.data || []

  // Split jobs by type
  const quoteJobs = jobs.filter((j: any) => j.status === 'quote')
  const activeJobs = jobs.filter((j: any) => j.status !== 'quote')
  
  // Calculate stats
  const scheduledJobs = allJobs.filter((j: any) => j.status === 'in_progress' || j.status === 'scheduled').length
  const pendingQuotesCount = quoteJobs.length + quotes.length
  const completedJobs = allJobs.filter((j: any) => j.status === 'completed')
  const revenueMTD = completedJobs.reduce((sum: number, j: any) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)
  const paidJobs = completedJobs.filter((j: any) => j.paid === true)
  const unpaidJobs = completedJobs.filter((j: any) => j.paid !== true)
  const outstandingAmount = unpaidJobs.reduce((sum: number, j: any) => sum + (Number(j.actual_amount) || Number(j.estimated_amount) || 0), 0)

  const stats = [
    { label: 'ACTIVE JOBS', value: scheduledJobs, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', tab: 'jobs' },
    { label: 'PENDING QUOTES', value: pendingQuotesCount, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10', tab: 'quotes' },
    { label: 'CUSTOMERS', value: customers.length, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', tab: 'customers' },
    { label: 'REVENUE MTD', value: `$${revenueMTD.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', tab: 'jobs' },
  ]

  const tabs = [
    { id: 'quotes', label: 'Quotes', icon: FileText, count: pendingQuotesCount },
    { id: 'jobs', label: 'Jobs', icon: Wrench, count: activeJobs.length },
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <TreeDeciduous className="size-5" />
            </div>
            <h1 className="text-lg font-bold">Bear Hub Pro</h1>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/schedule" className="size-9 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors" title="Schedule">
              <Calendar className="size-4" />
            </Link>
            <Link href="/payments" className="size-9 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors" title="Payments">
              <DollarSign className="size-4" />
            </Link>
            <Link href="/leads" className="size-9 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors" title="Leads">
              <UserPlus className="size-4" />
            </Link>
            <Link href="/weather" className="size-9 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors" title="Weather">
              <CloudSun className="size-4" />
            </Link>
            <Link href="/referrals" className="size-9 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors" title="Referrals">
              <Star className="size-4" />
            </Link>
            <Link href="/portal" className="size-9 flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors" title="Customer Portal">
              <Users className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { href: '/?tab=quotes', icon: FileText, label: 'Quotes' },
            { href: '/?tab=jobs', icon: Wrench, label: 'Jobs' },
            { href: '/?tab=customers', icon: Users, label: 'Clients' },
            { href: '/leads', icon: UserPlus, label: 'Leads' },
            { href: '/schedule', icon: Calendar, label: 'Schedule' },
            { href: '/payments', icon: DollarSign, label: 'Payments' },
            { href: '/weather', icon: CloudSun, label: 'Weather' },
            { href: '/referrals', icon: Star, label: 'Referrals' },
            { href: '/portal', icon: Users, label: 'Portal' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[72px] py-3 px-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <main className="p-4 pb-28 space-y-4">
        {/* Stats - clickable cards using Link (no JS needed) */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={`/?tab=${s.tab}`}
              className="block rounded-xl bg-card border border-border/50 p-4 active:scale-95 transition-transform hover:border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                <div className={`size-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`size-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
            </Link>
          ))}
        </div>

        {/* Outstanding Payment Alert */}
        {outstandingAmount > 0 && (
          <Link href="/payments" className="block">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:border-red-500/50 transition-colors">
              <AlertCircle className="size-5 text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-400">${outstandingAmount.toLocaleString()} Outstanding</p>
                <p className="text-sm text-muted-foreground">{unpaidJobs.length} completed job{unpaidJobs.length !== 1 ? 's' : ''} awaiting payment</p>
              </div>
              <ChevronRight className="size-4 text-red-400" />
            </div>
          </Link>
        )}

        {/* Revenue Gauge */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-6">
            <RevenueGauge current={revenueMTD} target={10000} label="Revenue This Month" />
          </CardContent>
        </Card>

        {/* Tabs - large touch targets using Link (no JS needed) */}
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/?tab=${tab.id}`}
              className={`flex flex-col items-center gap-1 py-4 px-2 rounded-xl font-medium transition-all active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border/50 text-muted-foreground hover:border-border'
              }`}
            >
              <tab.icon className="size-5" />
              <span className="text-sm">{tab.label}</span>
              <span className={`text-xs font-bold ${activeTab === tab.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {tab.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'quotes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Quotes</h2>
              <Link href="/quotes/new">
                <Button size="sm" className="gap-1">
                  <Plus className="size-4" /> New Quote
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {quoteJobs.length === 0 && quotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No quotes yet</p>
              ) : (
                <>
                  {quoteJobs.map((job: any) => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <FileText className="size-4 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{job.address || job.description || 'Quote'}</p>
                            <p className="text-sm text-muted-foreground truncate">{job.service_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <Badge variant="outline" className="text-xs bg-amber-500/15 text-amber-400 border-amber-500/30">Quote</Badge>
                          <p className="text-base font-bold">${Number(job.actual_amount || job.estimated_amount || 0).toLocaleString()}</p>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {quotes.map((quote: any) => (
                    <Link key={quote.id} href={`/quotes/${quote.id}`} className="block">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <FileText className="size-4 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{quote.customer?.name || quote.description}</p>
                            <p className="text-sm text-muted-foreground truncate">{quote.service_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <Badge variant="outline" className="text-xs bg-amber-500/15 text-amber-400 border-amber-500/30">Pending</Badge>
                          <p className="text-base font-bold">${Number(quote.amount || 0).toLocaleString()}</p>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Jobs</h2>
              <Link href="/jobs/new">
                <Button size="sm" className="gap-1">
                  <Plus className="size-4" /> New Job
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {activeJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No jobs yet</p>
              ) : (
                activeJobs.map((job: any) => {
                  const statusColors: Record<string, string> = {
                    scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                    in_progress: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                  }
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Wrench className="size-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{job.address || job.customer?.name || job.description}</p>
                            <p className="text-sm text-muted-foreground truncate">{job.service_type} {job.job_number ? `- ${job.job_number}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <Badge variant="outline" className={`text-xs ${statusColors[job.status] || 'bg-muted text-foreground'}`}>
                            {job.status === 'in_progress' ? 'Active' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                          <p className="text-base font-bold">${Number(job.actual_amount || job.estimated_amount || 0).toLocaleString()}</p>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Customers</h2>
              <Link href="/customers/new">
                <Button size="sm" className="gap-1">
                  <Plus className="size-4" /> New Customer
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {customers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No customers yet</p>
              ) : (
                customers.map((customer: any) => (
                  <Link key={customer.id} href={`/customers/${customer.id}`} className="block">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                          <Users className="size-4 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{customer.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{customer.address || customer.phone || customer.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
