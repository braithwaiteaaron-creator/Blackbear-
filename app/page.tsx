'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Briefcase, FileText, Users, TrendingUp, Bot, Calculator,
  Camera, TreeDeciduous, Plus, Loader2, Menu, X,
  BarChart3, Calendar, CreditCard, QrCode, Wrench,
  CheckCircle2, Clock, AlertCircle, ChevronRight, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { SimpleAIChat } from '@/components/simple-ai-chat'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { createCustomerAction, createJobAction, createQuoteAction } from './actions'

const statusConfig: Record<string, { label: string; className: string }> = {
  in_progress:  { label: 'In Progress',  className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  scheduled:    { label: 'Scheduled',    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  completed:    { label: 'Completed',    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled:    { label: 'Cancelled',    className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  pending:      { label: 'Pending',      className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  sent:         { label: 'Sent',         className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  accepted:     { label: 'Accepted',     className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  rejected:     { label: 'Rejected',     className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  on_hold:      { label: 'On Hold',      className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
}

const SERVICE_TYPES = [
  'Tree Removal',
  'Tree Trimming',
  'Stump Grinding',
  'Emergency Service',
  'Consultation',
  'Land Clearing',
  'Cabling & Bracing',
]

type Tab = 'quotes' | 'jobs' | 'customers' | 'ai'

export default function Dashboard() {
  console.log('[v0] Dashboard mounted - new version with Quotes first')
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

  const { data, isLoading, mutate } = useDashboardData()

  async function handleAddCustomer(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createCustomerAction(formData)
      setShowAddCustomer(false)
      mutate()
    } catch (e) { console.error(e) }
    setIsSubmitting(false)
  }

  async function handleAddJob(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createJobAction(formData)
      setShowAddJob(false)
      setJobCustomerId('')
      setJobServiceType('')
      mutate()
    } catch (e) { console.error(e) }
    setIsSubmitting(false)
  }

  async function handleAddQuote(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createQuoteAction(formData)
      setShowAddQuote(false)
      setQuoteCustomerId('')
      setQuoteServiceType('')
      mutate()
    } catch (e) { console.error(e) }
    setIsSubmitting(false)
  }

  const stats = [
    { label: 'Active Jobs',     value: data?.stats.activeJobs ?? 0,      icon: Briefcase,    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
    { label: 'Pending Quotes',  value: data?.stats.pendingQuotes ?? 0,    icon: FileText,     color: 'text-amber-400',   bg: 'bg-amber-500/10' },
    { label: 'Customers',       value: data?.stats.totalCustomers ?? 0,   icon: Users,        color: 'text-sky-400',     bg: 'bg-sky-500/10' },
    { label: 'Revenue MTD',     value: `$${(data?.stats.revenueMTD ?? 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ── Top Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TreeDeciduous className="size-4 text-primary" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">Bear Hub Pro</span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/analytics', icon: BarChart3, label: 'Analytics' },
              { href: '/calendar',  icon: Calendar,  label: 'Calendar' },
              { href: '/invoices',  icon: CreditCard, label: 'Invoices' },
              { href: '/referrals', icon: QrCode,     label: 'Referrals' },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
                  <Icon className="size-3.5" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(o => !o)}>
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-card px-4 py-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { href: '/analytics', icon: BarChart3, label: 'Analytics' },
                { href: '/calendar',  icon: Calendar,  label: 'Calendar' },
                { href: '/invoices',  icon: CreditCard, label: 'Invoices' },
                { href: '/referrals', icon: QrCode,     label: 'Referrals' },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary transition-colors">
                    <Icon className="size-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">

        {/* ── Stats Row ── */}
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
                {isLoading
                  ? <div className="h-7 w-14 bg-muted animate-pulse rounded" />
                  : <p className="text-2xl font-bold text-foreground">{s.value}</p>
                }
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Primary Tab Bar ── */}
        <div className="flex items-center gap-1 border-b border-border/50">
          {([
            { id: 'quotes',    label: 'Quotes',    icon: FileText },
            { id: 'jobs',      label: 'Jobs',      icon: Wrench },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'ai',        label: 'AI Tools',  icon: Sparkles },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { console.log('[v0] Tab clicked:', id); setActiveTab(id); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════
            QUOTES TAB
        ══════════════════════════════ */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            {/* Add Quote Form */}
            {showAddQuote && (
              <Card className="bg-card border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={handleAddQuote} className="space-y-4">
                    <input type="hidden" name="customer_id" value={quoteCustomerId} />
                    <input type="hidden" name="service_type" value={quoteServiceType} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Customer</Label>
                        <Select value={quoteCustomerId} onValueChange={setQuoteCustomerId}>
                          <SelectTrigger className="bg-secondary border-border h-11">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {data?.customers.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Service Type</Label>
                        <Select value={quoteServiceType} onValueChange={setQuoteServiceType}>
                          <SelectTrigger className="bg-secondary border-border h-11">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea name="description" placeholder="Describe the work..." className="bg-secondary border-border resize-none" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Amount ($)</Label>
                        <Input type="number" name="amount" placeholder="0.00" className="bg-secondary border-border h-11" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Valid Until <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                        <Input type="date" name="valid_until" className="bg-secondary border-border h-11" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button type="button" variant="outline" onClick={() => setShowAddQuote(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]">
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Create Quote'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Quotes Header + Add Button */}
            {!showAddQuote && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Quotes</h2>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? '...' : `${data?.quotes.length ?? 0} total`}
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddQuote(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 px-5"
                >
                  <Plus className="size-4" />
                  New Quote
                </Button>
              </div>
            )}

            {/* Quotes List */}
            <div className="space-y-2">
              {isLoading ? (
                [1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
              ) : data?.quotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No quotes yet</p>
                  <Button onClick={() => setShowAddQuote(true)} variant="outline" className="gap-2">
                    <Plus className="size-4" /> Create your first quote
                  </Button>
                </div>
              ) : (
                data?.quotes.map((quote) => {
                  const status = statusConfig[quote.status] ?? { label: quote.status, className: 'bg-muted text-foreground border-border' }
                  return (
                    <div key={quote.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <FileText className="size-4 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{quote.customer?.name || 'No customer'}</p>
                          <p className="text-sm text-muted-foreground truncate">{quote.service_type} &middot; {quote.quote_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <Badge variant="outline" className={`text-xs ${status.className}`}>{status.label}</Badge>
                        <p className="text-base font-bold text-foreground min-w-[60px] text-right">${Number(quote.amount).toLocaleString()}</p>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            JOBS TAB
        ══════════════════════════════ */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Add Job Form */}
            {showAddJob && (
              <Card className="bg-card border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New Job</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={handleAddJob} className="space-y-4">
                    <input type="hidden" name="customer_id" value={jobCustomerId} />
                    <input type="hidden" name="service_type" value={jobServiceType} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Customer</Label>
                        <Select value={jobCustomerId} onValueChange={setJobCustomerId}>
                          <SelectTrigger className="bg-secondary border-border h-11">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {data?.customers.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Service Type</Label>
                        <Select value={jobServiceType} onValueChange={setJobServiceType}>
                          <SelectTrigger className="bg-secondary border-border h-11">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea name="description" placeholder="Job details..." className="bg-secondary border-border resize-none" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Scheduled Date <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                        <Input type="date" name="scheduled_date" className="bg-secondary border-border h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Estimated Amount ($)</Label>
                        <Input type="number" name="estimated_amount" placeholder="0.00" className="bg-secondary border-border h-11" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Job Address <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                      <Input name="address" placeholder="123 Main St" className="bg-secondary border-border h-11" />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button type="button" variant="outline" onClick={() => setShowAddJob(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]">
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Create Job'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Jobs Header */}
            {!showAddJob && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Jobs</h2>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? '...' : `${data?.jobs.length ?? 0} total`}
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddJob(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 px-5"
                >
                  <Plus className="size-4" />
                  New Job
                </Button>
              </div>
            )}

            {/* Jobs List */}
            <div className="space-y-2">
              {isLoading ? (
                [1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
              ) : data?.jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                    <Briefcase className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No jobs yet</p>
                  <Button onClick={() => setShowAddJob(true)} variant="outline" className="gap-2">
                    <Plus className="size-4" /> Create your first job
                  </Button>
                </div>
              ) : (
                data?.jobs.map((job) => {
                  const status = statusConfig[job.status] ?? { label: job.status, className: 'bg-muted text-foreground border-border' }
                  const statusIcon = job.status === 'completed' ? CheckCircle2
                    : job.status === 'in_progress' ? Clock
                    : job.status === 'scheduled' ? Calendar
                    : AlertCircle
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Wrench className="size-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{job.customer?.name || 'No customer'}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {job.service_type} &middot; {job.job_number}
                              {job.scheduled_date ? ` · ${new Date(job.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ' · No date set'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <Badge variant="outline" className={`text-xs ${status.className} gap-1`}>
                            {status.label}
                          </Badge>
                          <p className="text-base font-bold text-foreground min-w-[60px] text-right">${Number(job.estimated_amount).toLocaleString()}</p>
                          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            CUSTOMERS TAB
        ══════════════════════════════ */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            {/* Add Customer Form */}
            {showAddCustomer && (
              <Card className="bg-card border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Add Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={handleAddCustomer} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input name="name" placeholder="Full name" className="bg-secondary border-border h-11" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input name="phone" type="tel" placeholder="(555) 123-4567" className="bg-secondary border-border h-11" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                      <Input name="email" type="email" placeholder="customer@email.com" className="bg-secondary border-border h-11" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Address</Label>
                        <Input name="address" placeholder="123 Main St" className="bg-secondary border-border h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>City</Label>
                        <Input name="city" placeholder="City" className="bg-secondary border-border h-11" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notes <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                      <Textarea name="notes" placeholder="Any notes about this customer..." className="bg-secondary border-border resize-none" rows={2} />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button type="button" variant="outline" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]">
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Add Customer'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Customers Header */}
            {!showAddCustomer && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Customers</h2>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? '...' : `${data?.customers.length ?? 0} total`}
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddCustomer(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 px-5"
                >
                  <Plus className="size-4" />
                  Add Customer
                </Button>
              </div>
            )}

            {/* Customers List */}
            <div className="space-y-2">
              {isLoading ? (
                [1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)
              ) : data?.customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                    <Users className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No customers yet</p>
                  <Button onClick={() => setShowAddCustomer(true)} variant="outline" className="gap-2">
                    <Plus className="size-4" /> Add your first customer
                  </Button>
                </div>
              ) : (
                data?.customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-sky-400">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{customer.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {customer.phone || customer.email || 'No contact info'}
                          {customer.city ? ` · ${customer.city}` : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            AI TOOLS TAB
        ══════════════════════════════ */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* AI Sub-tabs */}
            <div className="flex gap-2 flex-wrap">
              {([
                { id: 'assistant', label: 'Job Assistant', icon: Bot },
                { id: 'quote',     label: 'Quote Builder', icon: Calculator },
                { id: 'photo',     label: 'Tree Analysis', icon: Camera },
              ] as { id: typeof aiTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setAiTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    aiTab === id
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'bg-card border-border/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>

            {aiTab === 'assistant' && (
              <Card className="bg-card border-border/50">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI Job Assistant</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Equipment, crew sizing, safety, best practices</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <SimpleAIChat endpoint="/api/ai/assistant" title="Job Assistant" placeholder="Ask about equipment, crew sizing, time estimates, safety..." />
                </CardContent>
              </Card>
            )}

            {aiTab === 'quote' && (
              <Card className="bg-card border-border/50">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Calculator className="size-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI Quote Builder</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Describe a job and get professional pricing suggestions</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <SimpleAIChat endpoint="/api/ai/quote" title="Quote Builder" placeholder="e.g. 50ft oak removal near a house, difficult access..." />
                </CardContent>
              </Card>
            )}

            {aiTab === 'photo' && (
              <Card className="bg-card border-border/50">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Camera className="size-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Tree Analysis</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Describe tree issues for health assessment and recommendations</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <SimpleAIChat endpoint="/api/ai/analyze" title="Tree Analysis" placeholder="Describe what you see — species, size, damage, symptoms..." />
                </CardContent>
              </Card>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
