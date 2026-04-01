'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Briefcase, FileText, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Bot, Calculator, Wrench, Camera } from 'lucide-react'
import { SimpleAIChat } from '@/components/simple-ai-chat'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Demo data
const demoJobs = [
  {
    id: '1',
    job_number: 'J-20260401-001',
    description: 'Oak tree removal - 40ft height',
    service_type: 'Tree Removal',
    status: 'in_progress',
    customer: 'John Smith',
    amount: 1500,
    scheduled_date: '2026-04-01',
    address: '123 Oak Street, Austin, TX',
  },
  {
    id: '2',
    job_number: 'J-20260401-002',
    description: 'Pine tree trimming and cleanup',
    service_type: 'Tree Trimming',
    status: 'scheduled',
    customer: 'Sarah Johnson',
    amount: 800,
    scheduled_date: '2026-04-03',
    address: '456 Pine Ave, Austin, TX',
  },
  {
    id: '3',
    job_number: 'J-20260330-001',
    description: 'Stump grinding - 24 inch diameter',
    service_type: 'Stump Grinding',
    status: 'completed',
    customer: 'Mike Davis',
    amount: 600,
    scheduled_date: '2026-03-30',
    address: '789 Elm Drive, Austin, TX',
  },
]

const demoQuotes = [
  {
    id: '1',
    quote_number: 'Q-20260401-001',
    customer: 'Robert Wilson',
    description: 'Large oak removal with stump grinding',
    amount: 2500,
    status: 'pending',
    created_date: '2026-04-01',
  },
  {
    id: '2',
    quote_number: 'Q-20260401-002',
    customer: 'Emily Brown',
    description: 'Tree health assessment and pruning',
    amount: 450,
    status: 'sent',
    created_date: '2026-03-31',
  },
  {
    id: '3',
    quote_number: 'Q-20260330-001',
    customer: 'David Miller',
    description: 'Multiple tree removal project',
    amount: 5000,
    status: 'approved',
    created_date: '2026-03-30',
  },
]

const demoCustomers = [
  { id: '1', name: 'John Smith', email: 'john@email.com', phone: '(512) 555-0001', city: 'Austin' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '(512) 555-0002', city: 'Austin' },
  { id: '3', name: 'Mike Davis', email: 'mike@email.com', phone: '(512) 555-0003', city: 'Austin' },
  { id: '4', name: 'Robert Wilson', email: 'robert@email.com', phone: '(512) 555-0004', city: 'Austin' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'approved':
      return 'bg-emerald-100 text-emerald-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'scheduled':
    case 'sent':
      return 'bg-amber-100 text-amber-800'
    case 'pending':
      return 'bg-slate-100 text-slate-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
    case 'approved':
      return <CheckCircle className="w-4 h-4" />
    case 'in_progress':
      return <Clock className="w-4 h-4" />
    case 'pending':
      return <AlertCircle className="w-4 h-4" />
    default:
      return <TrendingUp className="w-4 h-4" />
  }
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('ai-quote')
  const [selectedJob, setSelectedJob] = useState<typeof demoJobs[0] | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<typeof demoQuotes[0] | null>(null)

  const activeJobsCount = demoJobs.filter(j => j.status === 'in_progress').length
  const completedJobsCount = demoJobs.filter(j => j.status === 'completed').length
  const pendingQuotesCount = demoQuotes.filter(q => q.status === 'pending').length
  const totalRevenue = demoJobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Bear Hub Pro</h1>
              <p className="text-slate-400">Tree Care Management System</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{activeJobsCount}</div>
              <p className="text-sm text-emerald-400 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{demoCustomers.length}</div>
              <p className="text-sm text-emerald-400 mt-1">Total clients</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Pending Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{pendingQuotesCount}</div>
              <p className="text-sm text-amber-400 mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Completed Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{completedJobsCount}</div>
              <p className="text-sm text-emerald-400 mt-1">${totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700 mb-6">
            <TabsTrigger value="ai-quote" className="text-slate-300 data-[state=active]:text-emerald-400 flex items-center gap-1">
              <Bot className="w-4 h-4" />
              <Calculator className="w-4 h-4" />
              AI Quote
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="text-slate-300 data-[state=active]:text-emerald-400 flex items-center gap-1">
              <Bot className="w-4 h-4" />
              <Wrench className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="ai-photo" className="text-slate-300 data-[state=active]:text-emerald-400 flex items-center gap-1">
              <Bot className="w-4 h-4" />
              <Camera className="w-4 h-4" />
              AI Photo
            </TabsTrigger>
            <div className="mx-2 h-6 w-px bg-slate-700"></div>
            <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-emerald-400">
              <Briefcase className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="text-slate-300 data-[state=active]:text-emerald-400">
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="quotes" className="text-slate-300 data-[state=active]:text-emerald-400">
              <FileText className="w-4 h-4 mr-2" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-slate-300 data-[state=active]:text-emerald-400">
              <Users className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Jobs</CardTitle>
                <CardDescription className="text-slate-400">Your most recent tree care jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoJobs.slice(0, 3).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{job.job_number}</p>
                        <p className="text-sm text-slate-400">{job.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{job.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">{job.status.replace('_', ' ')}</span>
                        </Badge>
                        <p className="text-lg font-bold text-emerald-400 mt-2">${job.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pending Quotes</CardTitle>
                <CardDescription className="text-slate-400">Quotes waiting for customer approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoQuotes.filter(q => q.status === 'pending').map(quote => (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{quote.quote_number}</p>
                        <p className="text-sm text-slate-400">{quote.customer}</p>
                        <p className="text-xs text-slate-500 mt-1">{quote.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                        <p className="text-lg font-bold text-emerald-400 mt-2">${quote.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoJobs.map(job => (
                    <Dialog key={job.id}>
                      <DialogTrigger>
                        <div className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{job.job_number} - {job.description}</p>
                              <p className="text-sm text-slate-400">{job.customer}</p>
                            </div>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700 text-white">
                        <DialogHeader>
                          <DialogTitle>{job.job_number}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-400">Description</p>
                            <p className="font-semibold">{job.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-400">Service Type</p>
                              <p className="font-semibold">{job.service_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">Amount</p>
                              <p className="font-semibold text-emerald-400">${job.amount}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Address</p>
                            <p className="font-semibold">{job.address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Customer</p>
                            <p className="font-semibold">{job.customer}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoQuotes.map(quote => (
                    <Dialog key={quote.id}>
                      <DialogTrigger>
                        <div className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{quote.quote_number}</p>
                              <p className="text-sm text-slate-400">{quote.customer}</p>
                            </div>
                            <Badge className={getStatusColor(quote.status)}>
                              {quote.status}
                            </Badge>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700 text-white">
                        <DialogHeader>
                          <DialogTitle>{quote.quote_number}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-400">Customer</p>
                            <p className="font-semibold">{quote.customer}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Description</p>
                            <p className="font-semibold">{quote.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-400">Amount</p>
                              <p className="font-semibold text-emerald-400">${quote.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">Status</p>
                              <Badge className={getStatusColor(quote.status)}>
                                {quote.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoCustomers.map(customer => (
                    <div key={customer.id} className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{customer.name}</p>
                          <p className="text-sm text-slate-400">{customer.email}</p>
                          <p className="text-sm text-slate-500">{customer.phone}</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800">{customer.city}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Quote Generator Tab */}
          <TabsContent value="ai-quote">
            <SimpleAIChat 
              endpoint="/api/ai/quote"
              title="AI Quote Generator"
              placeholder="Describe the tree job... e.g., '50ft oak tree removal near house'"
            />
          </TabsContent>

          {/* AI Job Assistant Tab */}
          <TabsContent value="ai-assistant">
            <SimpleAIChat 
              endpoint="/api/ai/assistant"
              title="AI Job Assistant"
              placeholder="Ask about equipment, timing, crew size, tree species, safety tips..."
            />
          </TabsContent>

          {/* AI Photo Analysis Tab */}
          <TabsContent value="ai-photo">
            <SimpleAIChat 
              endpoint="/api/ai/analyze"
              title="AI Photo Analysis"
              placeholder="Upload a tree photo and ask for analysis of health, damage, and recommended services..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
