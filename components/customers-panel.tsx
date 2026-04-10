"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Phone, MapPin, History, DollarSign, Users as UsersIcon, Navigation, TreeDeciduous, Clock } from "lucide-react"
import { useJobs, type Job } from "@/lib/supabase/hooks"
import { toast } from "sonner"

interface CustomerData {
  name: string
  address: string
  jobCount: number
  totalValue: number
  lastJobDate: string | null
  statuses: Set<string>
  jobs: Job[]
}

export function CustomersPanel() {
  const { jobs, loading } = useJobs()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Group jobs by customer
  const customerMap = new Map<string, CustomerData>()
  jobs.forEach((job) => {
    if (!customerMap.has(job.customer_name)) {
      customerMap.set(job.customer_name, {
        name: job.customer_name,
        address: job.address,
        jobCount: 0,
        totalValue: 0,
        lastJobDate: null,
        statuses: new Set(),
        jobs: [],
      })
    }
    const customer = customerMap.get(job.customer_name)!
    customer.jobCount += 1
    customer.totalValue += Number(job.value || 0)
    customer.lastJobDate = new Date(job.created_at) > new Date(customer.lastJobDate || 0) ? job.created_at : customer.lastJobDate
    customer.statuses.add(job.status)
    customer.jobs.push(job)
  })

  const customers = Array.from(customerMap.values()).sort((a, b) => 
    new Date(b.lastJobDate || 0).getTime() - new Date(a.lastJobDate || 0).getTime()
  )

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const needsFollowUp = customers.filter((c) => c.statuses.has("quote")).length

  const handleCall = (customer: CustomerData) => {
    // Try to find phone from notes in their jobs
    for (const job of customer.jobs) {
      const phoneMatch = job.notes?.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)
      if (phoneMatch) {
        window.location.href = `tel:${phoneMatch[0]}`
        return
      }
    }
    toast.info("No phone number found for this customer. Add phone to job notes.")
  }

  const handleViewHistory = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setIsHistoryOpen(true)
  }

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">View all your customers and their job history</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-bold">{customers.length}</p>
              </div>
              <UsersIcon className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Follow-up</p>
                <p className="text-3xl font-bold">{needsFollowUp}</p>
              </div>
              <Badge variant="destructive">{needsFollowUp}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">${customers.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-10 w-10 text-accent/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customer name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-8 text-center">
            <UsersIcon className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium text-muted-foreground">No customers yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first job to see customers here</p>
          </div>
        )}
        {filteredCustomers.map((customer) => (
          <Card key={customer.name} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    {customer.statuses.has("quote") && (
                      <Badge variant="destructive" className="text-xs">Follow-up Needed</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {customer.address}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <History className="h-4 w-4" />
                        {customer.jobCount} job{customer.jobCount !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${customer.totalValue.toLocaleString()} total
                      </div>
                    </div>
                    {customer.lastJobDate && (
                      <p className="text-xs">
                        Last job: {new Date(customer.lastJobDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCall(customer)}>
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDirections(customer.address)}>
                    <Navigation className="h-4 w-4 mr-1" />
                    Map
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleViewHistory(customer)}>
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.address}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold">{selectedCustomer.jobCount}</p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold text-accent">${selectedCustomer.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold">{selectedCustomer.statuses.has("quote") ? "Yes" : "No"}</p>
                  <p className="text-xs text-muted-foreground">Open Quote</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Job History</h4>
                <div className="space-y-3">
                  {selectedCustomer.jobs
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <TreeDeciduous className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{job.job_type}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(job.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent">${Number(job.value).toLocaleString()}</p>
                          <Badge variant={job.status === "completed" ? "secondary" : "outline"} className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => handleCall(selectedCustomer)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleDirections(selectedCustomer.address)}>
                  <Navigation className="mr-2 h-4 w-4" />
                  Directions
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
