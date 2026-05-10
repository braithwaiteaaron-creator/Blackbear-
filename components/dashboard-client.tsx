'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Briefcase, FileText, Users, TrendingUp, Plus, Loader2, Menu, X,
  Wrench, ChevronRight, TreeDeciduous
} from 'lucide-react'
import { createCustomerAction, createJobAction, createQuoteAction } from '@/app/actions'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

interface Job {
  id: string
  job_number: string | null
  customer_id: string | null
  service_type: string
  description: string
  status: string
  scheduled_date: string | null
  estimated_amount: number
  actual_amount: number | null
  paid: boolean
  address?: string | null
  notes?: string | null
  customer?: Customer | null
}

interface Quote {
  id: string
  quote_number: string | null
  customer_id: string | null
  service_type: string
  description: string
  amount: number
  status: string
  customer?: Customer | null
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

const SERVICE_TYPES = ['Tree Removal', 'Pruning', 'Stump Grinding', 'Emergency', 'Consultation', 'Other']

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [activeTab, setActiveTab] = useState<'quotes' | 'jobs' | 'customers'>('quotes')
  const [showAddQuote, setShowAddQuote] = useState(false)
  const [showAddJob, setShowAddJob] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quoteCustomerId, setQuoteCustomerId] = useState('')
  const [quoteServiceType, setQuoteServiceType] = useState('')
  const [jobCustomerId, setJobCustomerId] = useState('')
  const [jobServiceType, setJobServiceType] = useState('')

  // Split jobs into quotes (status='quote') and actual jobs
  const quoteJobs = initialData.jobs.filter(j => j.status === 'quote')
  const activeJobs = initialData.jobs.filter(j => j.status !== 'quote')
  const pendingQuotesCount = quoteJobs.length + initialData.quotes.length

  const stats = [
    { label: 'Active Jobs', value: initialData.stats.activeJobs, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending Quotes', value: pendingQuotesCount, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Customers', value: initialData.stats.totalCustomers, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Revenue MTD', value: `$${initialData.stats.revenueMTD.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  async function handleAddQuote(formData: FormData) {
    setIsSubmitting(true)
    formData.set('customer_id', quoteCustomerId)
    formData.set('service_type', quoteServiceType)
    await createQuoteAction(formData)
    window.location.reload()
  }

  async function handleAddJob(formData: FormData) {
    setIsSubmitting(true)
    formData.set('customer_id', jobCustomerId)
    formData.set('service_type', jobServiceType)
    await createJobAction(formData)
    window.location.reload()
  }

  async function handleAddCustomer(formData: FormData) {
    setIsSubmitting(true)
    await createCustomerAction(formData)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-white/10 flex items-center justify-center">
              <TreeDeciduous className="size-5" />
            </div>
            <h1 className="text-lg font-bold">Bear Hub Pro</h1>
          </div>
          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase">{s.label}</p>
                  <div className={`size-7 rounded-md ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`size-3.5 ${s.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Bar */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Revenue This Month</span>
              <span className="text-lg font-bold text-primary">${initialData.stats.revenueMTD.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: `${Math.min((initialData.stats.revenueMTD / 10000) * 100, 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$0</span>
              <span>$10,000</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'quotes' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            <FileText className="size-4" /> Quotes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'jobs' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            <Wrench className="size-4" /> Jobs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'customers' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            <Users className="size-4" /> Customers
          </button>
        </div>

        {/* QUOTES TAB */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Quotes</h2>
                <p className="text-sm text-muted-foreground">{quoteJobs.length} pending</p>
              </div>
              <Button type="button" onClick={() => setShowAddQuote(true)} className="gap-2">
                <Plus className="size-4" /> New Quote
              </Button>
            </div>

            {showAddQuote && (
              <Card className="border-primary">
                <CardContent className="p-4">
                  <form action={handleAddQuote} className="space-y-4">
                    <div>
                      <Label>Customer</Label>
                      <Select value={quoteCustomerId} onValueChange={setQuoteCustomerId}>
                        <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                        <SelectContent>
                          {initialData.customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Service Type</Label>
                      <Select value={quoteServiceType} onValueChange={setQuoteServiceType}>
                        <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea name="description" placeholder="Quote details..." />
                    </div>
                    <div>
                      <Label>Amount ($)</Label>
                      <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
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
              {quoteJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No quotes yet</p>
              ) : (
                quoteJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <FileText className="size-4 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{job.address || job.description || 'No address'}</p>
                          <p className="text-sm text-muted-foreground truncate">{job.service_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30">Quote</Badge>
                        <p className="font-bold">${Number(job.estimated_amount).toLocaleString()}</p>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Jobs</h2>
                <p className="text-sm text-muted-foreground">{activeJobs.length} total</p>
              </div>
              <Button type="button" onClick={() => setShowAddJob(true)} className="gap-2">
                <Plus className="size-4" /> New Job
              </Button>
            </div>

            {showAddJob && (
              <Card className="border-primary">
                <CardContent className="p-4">
                  <form action={handleAddJob} className="space-y-4">
                    <div>
                      <Label>Customer</Label>
                      <Select value={jobCustomerId} onValueChange={setJobCustomerId}>
                        <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                        <SelectContent>
                          {initialData.customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Service Type</Label>
                      <Select value={jobServiceType} onValueChange={setJobServiceType}>
                        <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea name="description" placeholder="Job details..." />
                    </div>
                    <div>
                      <Label>Estimated Amount ($)</Label>
                      <Input name="estimated_amount" type="number" step="0.01" placeholder="0.00" required />
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
              {activeJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No jobs yet</p>
              ) : (
                activeJobs.map((job) => {
                  const statusColor = job.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : job.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-border">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Wrench className="size-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{job.address || job.customer?.name || job.description || 'No address'}</p>
                            <p className="text-sm text-muted-foreground truncate">{job.service_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={statusColor}>{job.status}</Badge>
                          <p className="font-bold">${Number(job.estimated_amount).toLocaleString()}</p>
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

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Customers</h2>
                <p className="text-sm text-muted-foreground">{initialData.customers.length} total</p>
              </div>
              <Button type="button" onClick={() => setShowAddCustomer(true)} className="gap-2">
                <Plus className="size-4" /> Add Customer
              </Button>
            </div>

            {showAddCustomer && (
              <Card className="border-primary">
                <CardContent className="p-4">
                  <form action={handleAddCustomer} className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input name="name" placeholder="Customer name" required />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input name="phone" placeholder="Phone number" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" placeholder="Email" />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Textarea name="address" placeholder="Address" />
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
              {initialData.customers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No customers yet</p>
              ) : (
                initialData.customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Users className="size-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{customer.phone || customer.email || 'No contact'}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
