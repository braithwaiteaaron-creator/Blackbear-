'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Download, MoreVertical } from 'lucide-react'
import JobsList from '@/components/jobs-list'
import CustomersList from '@/components/customers-list'
import QuotesList from '@/components/quotes-list'
import JobForm from '@/components/job-form'
import CustomerForm from '@/components/customer-form'
import QuoteForm from '@/components/quote-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('jobs')
  const [jobsData, setJobsData] = useState([])
  const [customersData, setCustomersData] = useState([])
  const [quotesData, setQuotesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [showJobForm, setShowJobForm] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jobsRes, customersRes, quotesRes] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
      ])

      if (jobsRes.data) setJobsData(jobsRes.data)
      if (customersRes.data) setCustomersData(customersRes.data)
      if (quotesRes.data) setQuotesData(quotesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobCreated = () => {
    setShowJobForm(false)
    fetchData()
  }

  const handleCustomerCreated = () => {
    setShowCustomerForm(false)
    fetchData()
  }

  const handleQuoteCreated = () => {
    setShowQuoteForm(false)
    fetchData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bear Hub Pro</h1>
          <p className="text-slate-300">Professional tree care job and quote management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-2">Total Customers</p>
              <p className="text-3xl font-bold text-white">{customersData.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-2">Active Jobs</p>
              <p className="text-3xl font-bold text-white">{jobsData.filter(j => j.status !== 'completed').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-2">Pending Quotes</p>
              <p className="text-3xl font-bold text-white">{quotesData.filter(q => q.status === 'pending').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-2">Completed Jobs</p>
              <p className="text-3xl font-bold text-white">{jobsData.filter(j => j.status === 'completed').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-700 mb-6">
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>

              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  {activeTab === 'jobs' && 'Job Management'}
                  {activeTab === 'quotes' && 'Quote Management'}
                  {activeTab === 'customers' && 'Customer Management'}
                </h2>
                <Dialog 
                  open={activeTab === 'jobs' && showJobForm || activeTab === 'quotes' && showQuoteForm || activeTab === 'customers' && showCustomerForm}
                  onOpenChange={(open) => {
                    if (activeTab === 'jobs') setShowJobForm(open)
                    if (activeTab === 'quotes') setShowQuoteForm(open)
                    if (activeTab === 'customers') setShowCustomerForm(open)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add {activeTab === 'jobs' ? 'Job' : activeTab === 'quotes' ? 'Quote' : 'Customer'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Add New {activeTab === 'jobs' ? 'Job' : activeTab === 'quotes' ? 'Quote' : 'Customer'}
                      </DialogTitle>
                    </DialogHeader>
                    {activeTab === 'jobs' && <JobForm customers={customersData} onSuccess={handleJobCreated} />}
                    {activeTab === 'quotes' && <QuoteForm customers={customersData} onSuccess={handleQuoteCreated} />}
                    {activeTab === 'customers' && <CustomerForm onSuccess={handleCustomerCreated} />}
                  </DialogContent>
                </Dialog>
              </div>

              <TabsContent value="jobs" className="space-y-4">
                {loading ? (
                  <p className="text-slate-400">Loading...</p>
                ) : (
                  <JobsList jobs={jobsData} customers={customersData} onRefresh={fetchData} />
                )}
              </TabsContent>

              <TabsContent value="quotes" className="space-y-4">
                {loading ? (
                  <p className="text-slate-400">Loading...</p>
                ) : (
                  <QuotesList quotes={quotesData} customers={customersData} onRefresh={fetchData} />
                )}
              </TabsContent>

              <TabsContent value="customers" className="space-y-4">
                {loading ? (
                  <p className="text-slate-400">Loading...</p>
                ) : (
                  <CustomersList customers={customersData} onRefresh={fetchData} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
