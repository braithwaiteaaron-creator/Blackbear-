'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Briefcase, FileText, Users, TrendingUp, Bot, Calculator, Wrench, Camera, TreeDeciduous, ArrowRight, Sparkles, QrCode, BarChart3, Calendar, CreditCard, Menu, X, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SimpleAIChat } from '@/components/simple-ai-chat'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCustomerAction, createJobAction, createQuoteAction } from './actions'

const statusColors: Record<string, string> = {
  in_progress: 'bg-primary/20 text-primary border-primary/30',
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  sent: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('ai-assistant')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddJob, setShowAddJob] = useState(false)
  const [showAddQuote, setShowAddQuote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Controlled select values for forms
  const [jobCustomerId, setJobCustomerId] = useState('')
  const [jobServiceType, setJobServiceType] = useState('')
  const [quoteCustomerId, setQuoteCustomerId] = useState('')
  const [quoteServiceType, setQuoteServiceType] = useState('')
  
  const { data, isLoading, mutate } = useDashboardData()
  
  // Calculate stats from live data
  const stats = [
    { 
      label: 'Active Jobs', 
      value: data?.stats.activeJobs.toString() || '0', 
      change: 'Live from database', 
      icon: Briefcase 
    },
    { 
      label: 'Pending Quotes', 
      value: data?.stats.pendingQuotes.toString() || '0', 
      change: 'Awaiting response', 
      icon: FileText 
    },
    { 
      label: 'Total Customers', 
      value: data?.stats.totalCustomers.toString() || '0', 
      change: 'In database', 
      icon: Users 
    },
    { 
      label: 'Revenue MTD', 
      value: `$${(data?.stats.revenueMTD || 0).toLocaleString()}`, 
      change: 'This month', 
      icon: TrendingUp 
    },
  ]

  async function handleAddCustomer(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createCustomerAction(formData)
      setShowAddCustomer(false)
      mutate() // Refresh data
    } catch (error) {
      console.error('Failed to add customer:', error)
    }
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
    } catch (error) {
      console.error('Failed to add job:', error)
    }
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
    } catch (error) {
      console.error('Failed to add quote:', error)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="size-9 sm:size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <TreeDeciduous className="size-4 sm:size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Bear Hub Pro</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Tree Care Management</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <BarChart3 className="size-4 mr-1" />
                  Analytics
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Calendar className="size-4 mr-1" />
                  Calendar
                </Button>
              </Link>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <CreditCard className="size-4 mr-1" />
                  Invoices
                </Button>
              </Link>
              <Link href="/team">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Users className="size-4 mr-1" />
                  Team
                </Button>
              </Link>
              <Link href="/referrals">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <QrCode className="size-4 mr-1" />
                  Referrals
                </Button>
              </Link>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 ml-2">
                <Sparkles className="size-3 mr-1" />
                AI Enabled
              </Badge>
            </div>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-2 border-t border-border/50 pt-4">
              <div className="grid grid-cols-3 gap-2">
                <Link href="/analytics" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1">
                    <BarChart3 className="size-5" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                </Link>
                <Link href="/calendar" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1">
                    <Calendar className="size-5" />
                    <span className="text-xs">Calendar</span>
                  </Button>
                </Link>
                <Link href="/invoices" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1">
                    <CreditCard className="size-5" />
                    <span className="text-xs">Invoices</span>
                  </Button>
                </Link>
                <Link href="/team" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1">
                    <Users className="size-5" />
                    <span className="text-xs">Team</span>
                  </Button>
                </Link>
                <Link href="/referrals" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1">
                    <QrCode className="size-5" />
                    <span className="text-xs">Referrals</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1 sm:mb-2">
                Welcome back
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg">
                Manage your tree care business with AI-powered tools
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
                    {isLoading ? (
                      <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{stat.change}</p>
                  </div>
                  <div className="size-8 sm:size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="size-4 sm:size-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="bg-card border border-border/50 p-1 h-auto flex-wrap gap-1">
            <TabsTrigger 
              value="ai-assistant" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-4 py-2 sm:py-2.5 gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Bot className="size-3 sm:size-4" />
              <span className="hidden sm:inline">AI</span> Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="ai-quote" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-4 py-2 sm:py-2.5 gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Calculator className="size-3 sm:size-4" />
              <span className="hidden sm:inline">AI</span> Quote
            </TabsTrigger>
            <TabsTrigger 
              value="ai-photo" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-4 py-2 sm:py-2.5 gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Camera className="size-3 sm:size-4" />
              Photo
            </TabsTrigger>
            <div className="w-px h-6 bg-border mx-1 sm:mx-2 hidden sm:block" />
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-secondary px-2 sm:px-4 py-2 sm:py-2.5 gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Briefcase className="size-3 sm:size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="data-[state=active]:bg-secondary px-2 sm:px-4 py-2 sm:py-2.5 gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Wrench className="size-3 sm:size-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger 
              value="quotes" 
              className="data-[state=active]:bg-secondary px-2 sm:px-4 py-2 sm:py-2.5 gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <FileText className="size-3 sm:size-4" />
              Quotes
            </TabsTrigger>
          </TabsList>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-card border-border/50 h-full">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Bot className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">AI Job Assistant</CardTitle>
                        <CardDescription>Expert advice on planning, equipment, and best practices</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <SimpleAIChat 
                      endpoint="/api/ai/assistant"
                      title="Job Assistant"
                      placeholder="Ask about equipment needs, crew sizing, tree species, safety tips..."
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['Equipment needs', 'Crew sizing', 'Time estimates', 'Tree species', 'Safety protocols', 'Permit requirements'].map((topic) => (
                      <button 
                        key={topic}
                        className="w-full text-left px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors flex items-center justify-between group"
                      >
                        {topic}
                        <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Quote Generator Tab */}
          <TabsContent value="ai-quote" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-card border-border/50 h-full">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Calculator className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">AI Quote Generator</CardTitle>
                        <CardDescription>Describe the job and get professional pricing suggestions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <SimpleAIChat 
                      endpoint="/api/ai/quote"
                      title="Quote Generator"
                      placeholder="Describe the tree job... e.g., '50ft oak removal near house'"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Include These Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>For accurate quotes, mention:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Tree type and size
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Location and access
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Nearby structures
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Specific work needed
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Urgency level
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Photo Analysis Tab */}
          <TabsContent value="ai-photo" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-card border-border/50 h-full">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Camera className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">AI Photo Analysis</CardTitle>
                        <CardDescription>Upload tree photos for health assessment and recommendations</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <SimpleAIChat 
                      endpoint="/api/ai/analyze"
                      title="Photo Analyzer"
                      placeholder="Describe what you see or upload a photo for analysis..."
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Best Photo Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>For best analysis, capture:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Full tree view
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Trunk close-up
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Damaged areas
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5" />
                        Surrounding area
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Add Customer Form */}
            {showAddCustomer && (
              <Card className="bg-card border-primary/50">
                <CardHeader>
                  <CardTitle>Add New Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={handleAddCustomer} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input name="name" placeholder="Customer name" className="bg-secondary border-border" required />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input name="phone" placeholder="(555) 123-4567" className="bg-secondary border-border" required />
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" placeholder="customer@email.com" className="bg-secondary border-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Address</Label>
                        <Input name="address" placeholder="123 Main St" className="bg-secondary border-border" />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input name="city" placeholder="City" className="bg-secondary border-border" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
                        Add Customer
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setShowAddCustomer(true)} variant="outline" className="gap-2">
                <Plus className="size-4" /> Add Customer
              </Button>
              <Button onClick={() => { setActiveTab('jobs'); setShowAddJob(true); }} variant="outline" className="gap-2">
                <Plus className="size-4" /> New Job
              </Button>
              <Button onClick={() => { setActiveTab('quotes'); setShowAddQuote(true); }} variant="outline" className="gap-2">
                <Plus className="size-4" /> New Quote
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Jobs</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveTab('jobs')}>View all</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
                      </div>
                    ) : data?.jobs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No jobs yet. Create your first job!</p>
                    ) : (
                      data?.jobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-xs font-mono text-primary">
                              {job.job_number}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{job.customer?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{job.service_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={statusColors[job.status] || 'bg-muted'}>
                              {job.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">${job.estimated_amount}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pending Quotes</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveTab('quotes')}>View all</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1,2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
                      </div>
                    ) : data?.quotes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No quotes yet. Create your first quote!</p>
                    ) : (
                      data?.quotes.slice(0, 3).map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-xs font-mono text-primary">
                              {quote.quote_number}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{quote.customer?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{quote.service_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={statusColors[quote.status] || 'bg-muted'}>
                              {quote.status}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">${quote.amount}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            {showAddJob && (
              <Card className="bg-card border-primary/50">
                <CardHeader>
                  <CardTitle>Add New Job</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={handleAddJob} className="space-y-4">
                    <input type="hidden" name="customer_id" value={jobCustomerId} />
                    <input type="hidden" name="service_type" value={jobServiceType} />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="job-customer">Customer</Label>
                        <Select value={jobCustomerId} onValueChange={setJobCustomerId}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {data?.customers.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="job-service">Service Type</Label>
                        <Select value={jobServiceType} onValueChange={setJobServiceType}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tree Removal">Tree Removal</SelectItem>
                            <SelectItem value="Tree Trimming">Tree Trimming</SelectItem>
                            <SelectItem value="Stump Grinding">Stump Grinding</SelectItem>
                            <SelectItem value="Emergency Service">Emergency Service</SelectItem>
                            <SelectItem value="Consultation">Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="job-description">Description</Label>
                      <Textarea name="description" placeholder="Job details..." className="bg-secondary border-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="job-date">Scheduled Date</Label>
                        <Input type="date" name="scheduled_date" className="bg-secondary border-border" required />
                      </div>
                      <div>
                        <Label htmlFor="job-amount">Estimated Amount ($)</Label>
                        <Input type="number" name="estimated_amount" placeholder="0.00" className="bg-secondary border-border" required />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowAddJob(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
                        Create Job
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">All Jobs</CardTitle>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowAddJob(true)}>
                    <Plus className="size-4 mr-2" />
                    Add Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
                    </div>
                  ) : data?.jobs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No jobs yet. Click &quot;Add Job&quot; to create your first one!</p>
                  ) : (
                    data?.jobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-mono text-primary">
                            {job.job_number}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{job.customer?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{job.service_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={statusColors[job.status] || 'bg-muted'}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-lg font-semibold text-foreground">${job.estimated_amount}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            {showAddQuote && (
              <Card className="bg-card border-primary/50">
                <CardHeader>
                  <CardTitle>Create New Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={handleAddQuote} className="space-y-4">
                    <input type="hidden" name="customer_id" value={quoteCustomerId} />
                    <input type="hidden" name="service_type" value={quoteServiceType} />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Customer</Label>
                        <Select value={quoteCustomerId} onValueChange={setQuoteCustomerId}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {data?.customers.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Service Type</Label>
                        <Select value={quoteServiceType} onValueChange={setQuoteServiceType}>
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tree Removal">Tree Removal</SelectItem>
                            <SelectItem value="Tree Trimming">Tree Trimming</SelectItem>
                            <SelectItem value="Stump Grinding">Stump Grinding</SelectItem>
                            <SelectItem value="Emergency Service">Emergency Service</SelectItem>
                            <SelectItem value="Consultation">Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea name="description" placeholder="Quote details..." className="bg-secondary border-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Amount ($)</Label>
                        <Input type="number" name="amount" placeholder="0.00" className="bg-secondary border-border" required />
                      </div>
                      <div>
                        <Label>Valid Until</Label>
                        <Input type="date" name="valid_until" className="bg-secondary border-border" required />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowAddQuote(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
                        Create Quote
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">All Quotes</CardTitle>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowAddQuote(true)}>
                    <Plus className="size-4 mr-2" />
                    Create Quote
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
                    </div>
                  ) : data?.quotes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No quotes yet. Click &quot;Create Quote&quot; to create your first one!</p>
                  ) : (
                    data?.quotes.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-mono text-primary">
                            {quote.quote_number}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{quote.customer?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{quote.service_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={statusColors[quote.status] || 'bg-muted'}>
                            {quote.status}
                          </Badge>
                          <span className="text-lg font-semibold text-foreground">${quote.amount}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
