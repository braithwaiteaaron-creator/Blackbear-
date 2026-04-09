"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, TrendingUp, DollarSign, 
  Briefcase, FileText, BarChart3, Loader2, Wallet
} from 'lucide-react'
import { getPaymentBucketTotalsAction } from '@/app/actions'

interface AnalyticsData {
  jobs: Array<{
    id: string
    job_number: string
    service_type: string
    estimated_amount: number
    actual_amount: number | null
    status: string
    paid: boolean
    completed_date: string | null
    customer: { name: string } | null
  }>
  quotes: Array<{
    id: string
    service_type: string
    amount: number
    status: string
  }>
  customers: Array<{
    id: string
    name: string
  }>
  paymentBuckets: {
    total: number
    labour: number
    materials: number
    overhead: number
    taxReserve: number
    profit: number
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch dashboard data
        const dashRes = await fetch('/api/dashboard')
        const dashData = await dashRes.json()
        
        // Fetch payment bucket totals
        const bucketResult = await getPaymentBucketTotalsAction()
        
        setData({
          jobs: dashData.jobs || [],
          quotes: dashData.quotes || [],
          customers: dashData.customers || [],
          paymentBuckets: bucketResult.success ? bucketResult.data : {
            total: 0, labour: 0, materials: 0, overhead: 0, taxReserve: 0, profit: 0
          }
        })
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate metrics from real data
  const completedJobs = data?.jobs.filter(j => j.status === 'completed') || []
  const paidJobs = data?.jobs.filter(j => j.paid) || []
  const totalRevenue = paidJobs.reduce((sum, j) => sum + Number(j.actual_amount || j.estimated_amount), 0)
  const totalJobs = completedJobs.length
  const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0
  
  // Quote conversion rate
  const totalQuotes = data?.quotes.length || 0
  const approvedQuotes = data?.quotes.filter(q => q.status === 'approved').length || 0
  const conversionRate = totalQuotes > 0 ? Math.round((approvedQuotes / totalQuotes) * 100) : 0
  
  // Service breakdown from completed jobs
  const serviceMap = new Map<string, { jobs: number, revenue: number }>()
  completedJobs.forEach(job => {
    const current = serviceMap.get(job.service_type) || { jobs: 0, revenue: 0 }
    serviceMap.set(job.service_type, {
      jobs: current.jobs + 1,
      revenue: current.revenue + Number(job.actual_amount || job.estimated_amount)
    })
  })
  const serviceBreakdown = Array.from(serviceMap.entries())
    .map(([service, stats]) => ({
      service,
      jobs: stats.jobs,
      revenue: stats.revenue,
      percentage: totalRevenue > 0 ? Math.round((stats.revenue / totalRevenue) * 100) : 0
    }))
    .sort((a, b) => b.revenue - a.revenue)

  // Top customers by revenue
  const customerMap = new Map<string, { name: string, jobs: number, spent: number }>()
  paidJobs.forEach(job => {
    const name = job.customer?.name || 'Unknown'
    const current = customerMap.get(name) || { name, jobs: 0, spent: 0 }
    customerMap.set(name, {
      name,
      jobs: current.jobs + 1,
      spent: current.spent + Number(job.actual_amount || job.estimated_amount)
    })
  })
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)

  // Payment buckets
  const buckets = data?.paymentBuckets || { total: 0, labour: 0, materials: 0, overhead: 0, taxReserve: 0, profit: 0 }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

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
                  <p className="text-sm text-muted-foreground">Live business performance data</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl md:text-3xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">From paid jobs</p>
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
                  <p className="text-2xl md:text-3xl font-bold">{totalJobs}</p>
                  <p className="text-xs text-muted-foreground mt-1">{paidJobs.length} paid</p>
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
                  <p className="text-2xl md:text-3xl font-bold">${avgJobValue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Per completed job</p>
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
                  <p className="text-2xl md:text-3xl font-bold">{conversionRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{approvedQuotes} of {totalQuotes} quotes</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <FileText className="size-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Buckets - The Money Architecture */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              <CardTitle>Payment Bucket Allocations</CardTitle>
            </div>
            <CardDescription>Automatic financial allocation from paid jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {buckets.total === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payments processed yet. Mark a job as paid to see allocations.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Processed</p>
                  <p className="text-xl font-bold text-foreground">${buckets.total.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Labour (45%)</p>
                  <p className="text-xl font-bold text-blue-400">${buckets.labour.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-amber-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Materials (20%)</p>
                  <p className="text-xl font-bold text-amber-400">${buckets.materials.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Overhead (15%)</p>
                  <p className="text-xl font-bold text-purple-400">${buckets.overhead.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Tax Reserve (13%)</p>
                  <p className="text-xl font-bold text-red-400">${buckets.taxReserve.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Profit (7%)</p>
                  <p className="text-xl font-bold text-primary">${buckets.profit.toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Services Breakdown</CardTitle>
              <CardDescription>Revenue by service type</CardDescription>
            </CardHeader>
            <CardContent>
              {serviceBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No completed jobs yet</p>
              ) : (
                <div className="space-y-4">
                  {serviceBreakdown.map((service) => (
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
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Highest revenue generating customers</CardDescription>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No paid jobs yet</p>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
