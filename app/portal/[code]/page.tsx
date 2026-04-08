"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TreeDeciduous, Phone, Mail, Clock, CheckCircle, Calendar, 
  FileText, MapPin, Truck, AlertCircle, MessageSquare
} from 'lucide-react'

// Demo customer data - would come from database using the code
const customerData = {
  name: 'Johnson Property Management',
  email: 'johnson@propmanage.com',
  phone: '(512) 555-1234',
  address: '123 Oak St, Austin, TX 78701',
  memberSince: '2024-06-15',
  totalJobs: 12,
  totalSpent: 18500,
}

const customerJobs = [
  { 
    id: 'J-20260408-001', 
    service: 'Tree Removal', 
    description: 'Large oak tree removal near main building',
    address: '123 Oak St, Austin',
    status: 'in_progress', 
    scheduledDate: '2026-04-08',
    crew: 'Team Alpha',
    estimatedTime: '4 hours',
    amount: 1800,
    progress: 65,
    updates: [
      { date: '2026-04-08 8:00 AM', message: 'Crew arrived on site' },
      { date: '2026-04-08 9:30 AM', message: 'Tree sectioning in progress' },
      { date: '2026-04-08 11:00 AM', message: 'Main trunk removal complete, cleaning up' },
    ]
  },
  { 
    id: 'J-20260410-002', 
    service: 'Stump Grinding', 
    description: 'Grind remaining stump from previous removal',
    address: '123 Oak St, Austin',
    status: 'scheduled', 
    scheduledDate: '2026-04-10',
    crew: 'Team Beta',
    estimatedTime: '2 hours',
    amount: 400,
    progress: 0,
    updates: []
  },
  { 
    id: 'J-20260320-003', 
    service: 'Tree Trimming', 
    description: 'Trim 3 maple trees in parking lot',
    address: '456 Pine Ave, Austin',
    status: 'completed', 
    scheduledDate: '2026-03-20',
    completedDate: '2026-03-20',
    crew: 'Team Alpha',
    estimatedTime: '3 hours',
    amount: 950,
    progress: 100,
    updates: [
      { date: '2026-03-20 8:00 AM', message: 'Work started' },
      { date: '2026-03-20 11:30 AM', message: 'All trees trimmed, cleanup complete' },
    ]
  },
]

const customerQuotes = [
  { id: 'Q-20260405-001', service: 'Emergency Storm Damage', description: 'Assessment and removal of damaged branches', amount: 1200, status: 'pending', validUntil: '2026-04-20' },
]

export default function CustomerPortal() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('jobs')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">In Progress</Badge>
      case 'scheduled':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Scheduled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <TreeDeciduous className="size-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bear Hub Pro</h1>
                <p className="text-sm text-muted-foreground">Customer Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Phone className="size-4 mr-2" />
                Call Us
              </Button>
              <Button size="sm">
                <MessageSquare className="size-4 mr-2" />
                Request Service
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Welcome, {customerData.name}</h2>
                <p className="text-muted-foreground mt-1">Track your jobs, view quotes, and manage your account</p>
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    {customerData.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    {customerData.phone}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Customer since {new Date(customerData.memberSince).toLocaleDateString()}</p>
                <p className="text-3xl font-bold text-primary mt-2">{customerData.totalJobs}</p>
                <p className="text-sm text-muted-foreground">Jobs Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={activeTab === 'jobs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('jobs')}
          >
            <Truck className="size-4 mr-2" />
            My Jobs
          </Button>
          <Button 
            variant={activeTab === 'quotes' ? 'default' : 'outline'}
            onClick={() => setActiveTab('quotes')}
          >
            <FileText className="size-4 mr-2" />
            Quotes
          </Button>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {customerJobs.map(job => (
              <Card key={job.id} className="bg-card border-border overflow-hidden">
                <div className="flex">
                  {/* Main Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold">{job.service}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                      </div>
                      <p className="text-xl font-bold">${job.amount.toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Scheduled</p>
                          <p className="font-medium">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{job.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Est. Time</p>
                          <p className="font-medium">{job.estimatedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Crew</p>
                          <p className="font-medium">{job.crew}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {job.status === 'in_progress' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{job.progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Updates Sidebar */}
                  {job.updates.length > 0 && (
                    <div className="w-80 bg-secondary/30 border-l border-border p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertCircle className="size-4 text-primary" />
                        Live Updates
                      </h4>
                      <div className="space-y-3">
                        {job.updates.map((update, i) => (
                          <div key={i} className="text-sm">
                            <p className="text-xs text-muted-foreground">{update.date}</p>
                            <p>{update.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            {customerQuotes.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending quotes</p>
                </CardContent>
              </Card>
            ) : (
              customerQuotes.map(quote => (
                <Card key={quote.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{quote.service}</h3>
                          <Badge className="bg-amber-500/20 text-amber-500">Pending Approval</Badge>
                        </div>
                        <p className="text-muted-foreground">{quote.description}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${quote.amount.toLocaleString()}</p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">Decline</Button>
                          <Button size="sm">
                            <CheckCircle className="size-4 mr-2" />
                            Approve Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 bg-card">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at (512) 555-TREE or support@bearhubpro.com</p>
          <p className="mt-1">Blackbear Tree Care - Professional Tree Services</p>
        </div>
      </footer>
    </div>
  )
}
