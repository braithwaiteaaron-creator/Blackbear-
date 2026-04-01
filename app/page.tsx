'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Briefcase, FileText, Users, TrendingUp, Bot, Calculator, Wrench, Camera, TreeDeciduous, ArrowRight, Sparkles } from 'lucide-react'
import { SimpleAIChat } from '@/components/simple-ai-chat'

// Demo data
const stats = [
  { label: 'Active Jobs', value: '12', change: '+3 this week', icon: Briefcase },
  { label: 'Pending Quotes', value: '8', change: '4 awaiting response', icon: FileText },
  { label: 'Total Customers', value: '47', change: '+5 this month', icon: Users },
  { label: 'Revenue MTD', value: '$24,350', change: '+18% vs last month', icon: TrendingUp },
]

const recentJobs = [
  { id: '1', number: 'J-001', customer: 'John Smith', service: 'Tree Removal', status: 'in_progress', amount: '$2,400' },
  { id: '2', number: 'J-002', customer: 'Sarah Johnson', service: 'Trimming', status: 'scheduled', amount: '$850' },
  { id: '3', number: 'J-003', customer: 'Mike Davis', service: 'Stump Grinding', status: 'completed', amount: '$450' },
]

const recentQuotes = [
  { id: '1', number: 'Q-001', customer: 'Emily Brown', service: 'Large Oak Removal', status: 'pending', amount: '$3,200' },
  { id: '2', number: 'Q-002', customer: 'Robert Wilson', service: 'Full Yard Cleanup', status: 'sent', amount: '$1,800' },
]

const statusColors: Record<string, string> = {
  in_progress: 'bg-primary/20 text-primary border-primary/30',
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  sent: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('ai-assistant')

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <TreeDeciduous className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Bear Hub Pro</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Tree Care Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                <Sparkles className="size-3 mr-1" />
                AI Enabled
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                Welcome back
              </h2>
              <p className="text-muted-foreground text-lg">
                Manage your tree care business with AI-powered tools
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="size-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border/50 p-1 h-auto">
            <TabsTrigger 
              value="ai-assistant" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2.5 gap-2"
            >
              <Bot className="size-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="ai-quote" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2.5 gap-2"
            >
              <Calculator className="size-4" />
              AI Quote Generator
            </TabsTrigger>
            <TabsTrigger 
              value="ai-photo" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2.5 gap-2"
            >
              <Camera className="size-4" />
              Photo Analysis
            </TabsTrigger>
            <div className="w-px h-6 bg-border mx-2" />
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-secondary px-4 py-2.5 gap-2"
            >
              <Briefcase className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="data-[state=active]:bg-secondary px-4 py-2.5 gap-2"
            >
              <Wrench className="size-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger 
              value="quotes" 
              className="data-[state=active]:bg-secondary px-4 py-2.5 gap-2"
            >
              <FileText className="size-4" />
              Quotes
            </TabsTrigger>
          </TabsList>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
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
          <TabsContent value="ai-quote" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
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
          <TabsContent value="ai-photo" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
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
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Jobs</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary">View all</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-xs font-mono text-primary">
                            {job.number}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{job.customer}</p>
                            <p className="text-xs text-muted-foreground">{job.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={statusColors[job.status]}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">{job.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pending Quotes</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary">View all</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentQuotes.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-xs font-mono text-primary">
                            {quote.number}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{quote.customer}</p>
                            <p className="text-xs text-muted-foreground">{quote.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={statusColors[quote.status]}>
                            {quote.status}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">{quote.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">All Jobs</CardTitle>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Add Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-mono text-primary">
                          {job.number}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{job.customer}</p>
                          <p className="text-sm text-muted-foreground">{job.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={statusColors[job.status]}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-lg font-semibold text-foreground">{job.amount}</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">All Quotes</CardTitle>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Create Quote
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQuotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-mono text-primary">
                          {quote.number}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{quote.customer}</p>
                          <p className="text-sm text-muted-foreground">{quote.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={statusColors[quote.status]}>
                          {quote.status}
                        </Badge>
                        <span className="text-lg font-semibold text-foreground">{quote.amount}</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
