"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TreeDeciduous, ArrowLeft, TrendingUp, TrendingDown, DollarSign, 
  Briefcase, Users, FileText, Calendar, BarChart3, PieChart
} from 'lucide-react'

// Demo data for analytics
const monthlyRevenue = [
  { month: 'Jan', revenue: 12500, jobs: 15 },
  { month: 'Feb', revenue: 14200, jobs: 18 },
  { month: 'Mar', revenue: 18900, jobs: 24 },
  { month: 'Apr', revenue: 22100, jobs: 28 },
  { month: 'May', revenue: 26500, jobs: 32 },
  { month: 'Jun', revenue: 31200, jobs: 38 },
]

const serviceBreakdown = [
  { service: 'Tree Removal', jobs: 45, revenue: 67500, percentage: 42 },
  { service: 'Tree Trimming', jobs: 62, revenue: 31000, percentage: 28 },
  { service: 'Stump Grinding', jobs: 38, revenue: 19000, percentage: 15 },
  { service: 'Emergency Services', jobs: 12, revenue: 18000, percentage: 10 },
  { service: 'Consultations', jobs: 28, revenue: 5600, percentage: 5 },
]

const topCustomers = [
  { name: 'Johnson Property Management', jobs: 12, spent: 18500 },
  { name: 'Smith Realty Group', jobs: 8, spent: 12200 },
  { name: 'Oak Hills HOA', jobs: 6, spent: 9800 },
  { name: 'Green Valley Landscaping', jobs: 5, spent: 7500 },
  { name: 'Riverside Apartments', jobs: 4, spent: 6200 },
]

const recentActivity = [
  { type: 'job_completed', description: 'Tree removal completed at 123 Oak St', time: '2 hours ago', amount: 1500 },
  { type: 'quote_approved', description: 'Quote approved by Johnson Property', time: '4 hours ago', amount: 2800 },
  { type: 'payment_received', description: 'Payment received from Smith Realty', time: '6 hours ago', amount: 1200 },
  { type: 'new_customer', description: 'New customer: Maple Grove HOA', time: '1 day ago', amount: 0 },
  { type: 'job_scheduled', description: 'Emergency trimming scheduled', time: '1 day ago', amount: 800 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months')

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
  const totalJobs = monthlyRevenue.reduce((sum, m) => sum + m.jobs, 0)
  const avgJobValue = totalRevenue / totalJobs
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue))

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="size-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Analytics & Reports</h1>
                  <p className="text-sm text-muted-foreground">Business performance insights</p>
                </div>
              </div>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="size-4 text-green-500" />
                    <span className="text-sm text-green-500">+18.2%</span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="size-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                  <p className="text-3xl font-bold">{totalJobs}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="size-4 text-green-500" />
                    <span className="text-sm text-green-500">+12 jobs</span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Briefcase className="size-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Job Value</p>
                  <p className="text-3xl font-bold">${avgJobValue.toFixed(0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="size-4 text-green-500" />
                    <span className="text-sm text-green-500">+$85</span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <TrendingUp className="size-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quote Conversion</p>
                  <p className="text-3xl font-bold">68%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="size-4 text-red-500" />
                    <span className="text-sm text-red-500">-3%</span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <FileText className="size-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card className="col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-4">
                {monthlyRevenue.map((data, i) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">${(data.revenue / 1000).toFixed(1)}k</span>
                    <div 
                      className="w-full bg-primary/80 rounded-t-md transition-all hover:bg-primary"
                      style={{ height: `${(data.revenue / maxRevenue) * 180}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Services Breakdown</CardTitle>
              <CardDescription>Revenue by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceBreakdown.map((service, i) => (
                  <div key={service.service}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{service.service}</span>
                      <span className="text-sm text-muted-foreground">{service.percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${service.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{service.jobs} jobs</span>
                      <span className="text-xs text-primary">${service.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top Customers */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Highest revenue generating customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCustomers.map((customer, i) => (
                  <div key={customer.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.jobs} jobs completed</p>
                      </div>
                    </div>
                    <p className="font-semibold text-primary">${customer.spent.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest business activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`size-2 rounded-full ${
                        activity.type === 'job_completed' ? 'bg-green-500' :
                        activity.type === 'quote_approved' ? 'bg-blue-500' :
                        activity.type === 'payment_received' ? 'bg-primary' :
                        activity.type === 'new_customer' ? 'bg-purple-500' :
                        'bg-amber-500'
                      }`} />
                      <div>
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    {activity.amount > 0 && (
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        ${activity.amount.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
