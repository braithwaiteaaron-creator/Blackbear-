'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Briefcase, FileText, Users, TrendingUp, Bot, Calculator,
  Camera, TreeDeciduous, Plus, Loader2, Menu, X,
  Wrench, CheckCircle2, Clock, AlertCircle, ChevronRight, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { SimpleAIChat } from '@/components/simple-ai-chat'
import { createCustomerAction, createJobAction, createQuoteAction } from '@/app/actions'
import { RevenueGauge } from '@/components/revenue-gauge'
import { MarkJobDoneButton } from '@/components/mark-job-done-button'
import { useRouter } from 'next/navigation'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Job {
  id: string
  job_number: string
  customer_id: string
  service_type: string
  description: string
  status: string
  scheduled_date: string | null
  estimated_amount: number
  actual_amount: number | null
  paid: boolean
  customer?: Customer
}

interface Quote {
  id: string
  quote_number: string
  customer_id: string
  service_type: string
  description: string
  status: string
  amount: number
  customer?: Customer
}

interface DashboardData {
  customers: Customer[]
  jobs: Job[]
  quotes: Quote[]
  stats: {
    activeJobs: number
    pendingQuotes: number
    completedJobs: number
    totalCustomers: number
    revenueMTD: number
  }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  in_progress:  { label: 'In Progress',  className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  scheduled:    { label: 'Scheduled',    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  completed:    { label: 'Completed',    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled:    { label: 'Cancelled',    className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  pending:      { label: 'Pending',      className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  sent:         { label: 'Sent',         className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  accepted:     { label: 'Accepted',     className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  rejected:     { label: 'Rejected',     className: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

const SERVICE_TYPES = [
  'Tree Removal', 'Tree Trimming', 'Stump Grinding', 'Emergency Service',
  'Consultation', 'Land Clearing', 'Cabling & Bracing',
]

type Tab = 'quotes' | 'jobs' | 'customers' | 'ai'

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [activeTab, setActiveTab] = useState<Tab>('quotes')
  const [aiTab, setAiTab] = useState<'assistant' | 'quote' | 'photo'>('assistant')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddJob, setShowAddJob] = useState(false)
  const [showAddQuote, setShowAddQuote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobCustomerId, setJobCustomerId] = useState('')
  const [jobServiceType, setJobServiceType] = useState('')
  const [quoteCustomerId, setQuoteCustomerId] = useState('')
  const [quoteServiceType, setQuoteServiceType] = useState('')

  const refreshData = () => router.refresh()

  async function handleAddCustomer(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createCustomerAction(formData)
      setShowAddCustomer(false)
      refreshData()
    } catch (e) { console.error(e) }
    setIsSubmitting(false)
  }

  async function handleAddJob(formData: FormData) {
    setIsSubmitting(true)
    try {
      formData.set('customer_id', jobCustomerId)
      formData.set('service_type', jobServiceType)
      await createJobAction(formData)
      setShowAddJob(false)
      setJobCustomerId('')
      setJobServiceType('')
      refreshData()
    } catch (e) { console.error(e) }
    setIsSubmitting(false)
  }

  async function handleAddQuote(formData: FormData) {
    setIsSubmitting(true)
    try {
      formData.set('customer_id', quoteCustomerId)
      formData.set('service_type', quoteServiceType)
      await createQuoteAction(formData)
      setShowAddQuote(false)
      setQuoteCustomerId('')
      setQuoteServiceType('')
      refreshData()
    } catch (e) { console.error(e) }
    setIsSubmitting(false)
  }

  const stats = [
    { label: 'Active Jobs', value: data.stats.activeJobs, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending Quotes', value: data.stats.pendingQuotes, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Customers', value: data.stats.totalCustomers, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Revenue MTD', value: `$${data.stats.revenueMTD.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  const tabs: { id: Tab; label: string; icon: typeof Briefcase }[] = [
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Wrench },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'ai', label: 'AI Tools', icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center">
              <TreeDeciduous className="size-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Bear Hub Pro</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-secondary">
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                  <div className={`size-7 rounded-md ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`size-3.5 ${s.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Gauge */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-6">
            <RevenueGauge current={data.stats.revenueMTD} target={10000} label="Revenue This Month" />
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/50 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Quotes</h2>
                <p className="text-sm text-muted-foreground">{data.quotes.length} total</p>
              </div>
              <Button onClick={() => setShowAddQuote(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="size-4 mr-2" /> New Quote
              </Button>
            </div>

            {showAddQuote && (
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <form action={handleAddQuote} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Customer</Label>
                        <Select value={quoteCustomerId} onValueChange={setQuoteCustomerId}>
                          <SelectTrigger className="h-11 bg-secondary"><SelectValue placeholder="Select customer" /></SelectTrigger>
                          <SelectContent>
                            {data.customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Service Type</Label>
                        <Select value={quoteServiceType} onValueChange={setQuoteServiceType}>
                          <SelectTrigger className="h-11 bg-secondary"><SelectValue placeholder="Select service" /></SelectTrigger>
                          <SelectContent>
                            {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea name="description" placeholder="Quote details..." className="bg-secondary min-h-[80px]" />
                    </div>
                    <div>
                      <Label>Amount ($)</Label>
                      <Input type="number" name="amount" placeholder="0.00" className="h-11 bg-secondary" required />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Create Quote'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddQuote(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {data.quotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No quotes yet. Create your first quote!</p>
              ) : (
                data.quotes.map((quote) => {
                  const status = statusConfig[quote.status] ?? { label: quote.status, className: 'bg-muted text-foreground' }
                  return (
                    <Link key={quote.id} href={`/quotes/${quote.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <FileText className="size-4 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{quote.customer?.name || 'No customer'}</p>
                            <p className="text-sm text-muted-foreground truncate">{quote.service_type} - {quote.quote_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <Badge variant="outline" className={`text-xs ${status.className}`}>{status.label}</Badge>
                          <p className="text-base font-bold text-foreground">${Number(quote.amount).toLocaleString()}</p>
                          <ChevronRight className="size-4 text-muted-foreground hidden sm:block" />
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Jobs</h2>
                <p className="text-sm text-muted-foreground">{data.jobs.length} total</p>
              </div>
              <Button onClick={() => setShowAddJob(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="size-4 mr-2" /> New Job
              </Button>
            </div>

            {showAddJob && (
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <form action={handleAddJob} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Customer</Label>
                        <Select value={jobCustomerId} onValueChange={setJobCustomerId}>
                          <SelectTrigger className="h-11 bg-secondary"><SelectValue placeholder="Select customer" /></SelectTrigger>
                          <SelectContent>
                            {data.customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Service Type</Label>
                        <Select value={jobServiceType} onValueChange={setJobServiceType}>
                          <SelectTrigger className="h-11 bg-secondary"><SelectValue placeholder="Select service" /></SelectTrigger>
                          <SelectContent>
                            {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea name="description" placeholder="Job details..." className="bg-secondary min-h-[80px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Scheduled Date <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                        <Input type="date" name="scheduled_date" className="h-11 bg-secondary" />
                      </div>
                      <div>
                        <Label>Estimated Amount ($)</Label>
                        <Input type="number" name="estimated_amount" placeholder="0.00" className="h-11 bg-secondary" required />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Create Job'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddJob(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {data.jobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No jobs yet. Create your first job!</p>
              ) : (
                data.jobs.map((job) => {
                  const status = statusConfig[job.status] ?? { label: job.status, className: 'bg-muted text-foreground' }
                  return (
                    <div key={job.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors group">
                      <Link href={`/jobs/${job.id}`} className="flex-1 flex items-center justify-between cursor-pointer min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Wrench className="size-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{job.customer?.name || 'No customer'}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {job.service_type} - {job.job_number}
                              {job.scheduled_date ? ` - ${new Date(job.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ' - No date set'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <Badge variant="outline" className={`text-xs ${status.className}`}>{status.label}</Badge>
                          <p className="text-base font-bold text-foreground">${Number(job.estimated_amount).toLocaleString()}</p>
                          <ChevronRight className="size-4 text-muted-foreground hidden sm:block" />
                        </div>
                      </Link>
                      {job.status !== 'completed' && !job.paid && (
                        <div className="ml-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <MarkJobDoneButton 
                            jobId={job.id}
                            jobNumber={job.job_number}
                            estimatedAmount={Number(job.estimated_amount)}
                            onSuccess={refreshData}
                          />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Customers</h2>
                <p className="text-sm text-muted-foreground">{data.customers.length} total</p>
              </div>
              <Button onClick={() => setShowAddCustomer(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="size-4 mr-2" /> Add Customer
              </Button>
            </div>

            {showAddCustomer && (
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <form action={handleAddCustomer} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input name="name" placeholder="Customer name" className="h-11 bg-secondary" required />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input name="phone" placeholder="Phone number" className="h-11 bg-secondary" />
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" name="email" placeholder="Email address" className="h-11 bg-secondary" />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input name="address" placeholder="Street address" className="h-11 bg-secondary" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Add Customer'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {data.customers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No customers yet. Add your first customer!</p>
              ) : (
                data.customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                        <Users className="size-4 text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{customer.address || customer.phone || customer.email || 'No contact info'}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'assistant' as const, label: 'AI Assistant', icon: Bot },
                { id: 'quote' as const, label: 'Quote Builder', icon: Calculator },
                { id: 'photo' as const, label: 'Photo Analysis', icon: Camera },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setAiTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    aiTab === id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <SimpleAIChat mode={aiTab} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
