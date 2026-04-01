"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TreeDeciduous,
  Plus,
  Search,
  Camera,
  FileText,
  MapPin,
  Clock,
  DollarSign,
  QrCode,
  Loader2,
  AlertTriangle,
  Mountain,
} from "lucide-react"
import { JobPhotoUpload } from "./job-photo-upload"
import { useJobs, useReferrers } from "@/lib/supabase/hooks"
import { toast } from "sonner"

export function JobsPanel() {
  const { jobs, loading, createJob } = useJobs()
  const { referrers } = useReferrers()
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewJobOpen, setIsNewJobOpen] = useState(false)
  const [newJobPhotos, setNewJobPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    address: "",
    customer_name: "",
    customer_phone: "",
    job_type: "",
    value: "",
    referral_code: "",
    notes: "",
  })

  const filteredJobs = jobs.filter(
    (job) =>
      job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!formData.address || !formData.customer_name || !formData.job_type) {
      toast.error("Please fill in address, customer name, and job type")
      return
    }

    setIsSubmitting(true)
    
    // Find referrer if code provided
    const matchedReferrer = formData.referral_code 
      ? referrers.find(r => r.referral_code.toLowerCase() === formData.referral_code.toLowerCase())
      : null

    const { data, error } = await createJob({
      address: formData.address,
      customer_name: formData.customer_name,
      job_type: formData.job_type,
      value: parseFloat(formData.value) || 0,
      trees: [],
      notes: formData.notes + (matchedReferrer ? ` [Referral: ${matchedReferrer.name}]` : ""),
      permit_required: false,
      clearance_required: false,
      climbing_required: false,
      status: "quote",
      photos: [],
    })
    setIsSubmitting(false)

    if (error) {
      toast.error("Failed to create job")
    } else {
      toast.success(matchedReferrer ? `Job created! Referral from ${matchedReferrer.name}` : "Job created!")
      setIsNewJobOpen(false)
      setFormData({
        address: "",
        customer_name: "",
        customer_phone: "",
        job_type: "",
        value: "",
        referral_code: "",
        notes: "",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "destructive"
      case "in-progress":
        return "default"
      case "scheduled":
        return "secondary"
      case "quote":
        return "outline"
      case "completed":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs & Quotes</h1>
          <p className="text-muted-foreground">Manage all tree service jobs and customer quotes</p>
        </div>
        <Dialog open={isNewJobOpen} onOpenChange={setIsNewJobOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
              <DialogDescription>
                Enter job details to create a new quote for a customer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Address */}
              <div className="grid gap-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="address" 
                    placeholder="123 Main St..." 
                    className="pl-9"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Customer Name + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Input 
                    id="customer" 
                    placeholder="Name..."
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="(555) 123-4567"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Job Type + Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select 
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tree Removal">Tree Removal</SelectItem>
                      <SelectItem value="Pruning">Pruning</SelectItem>
                      <SelectItem value="Stump Grinding">Stump Grinding</SelectItem>
                      <SelectItem value="Storm Damage">Storm Damage</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="value" 
                      type="number" 
                      placeholder="0" 
                      className="pl-9"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Referral Code */}
              <div className="grid gap-2">
                <Label htmlFor="referral">Referral Code (optional)</Label>
                <div className="relative">
                  <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="referral" 
                    placeholder="e.g. JOHN10"
                    className="pl-9"
                    value={formData.referral_code}
                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                  />
                </div>
                {formData.referral_code && referrers.find(r => r.referral_code.toLowerCase() === formData.referral_code.toLowerCase()) && (
                  <p className="text-xs text-primary">Referral from: {referrers.find(r => r.referral_code.toLowerCase() === formData.referral_code.toLowerCase())?.name}</p>
                )}
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any details..."
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div className="border-t pt-4">
              <JobPhotoUpload 
                jobId="new" 
                onPhotosChange={setNewJobPhotos}
              />
              {newJobPhotos.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {newJobPhotos.length} photo(s) ready to upload with this job
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewJobOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Quote
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs by address, customer, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Tabs */}
      {!loading && (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4">
              {filteredJobs.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-8 text-center">
                  <TreeDeciduous className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-muted-foreground">No jobs yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Tap &quot;New Quote&quot; to add your first job</p>
                </div>
              )}
              {filteredJobs.map((job) => (
                <Card key={job.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <TreeDeciduous className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{job.address}</h3>
                            <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.customer_name}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {job.job_type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Camera className="h-3 w-3" />
                              {job.photos?.length || 0} photos
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                            {job.permit_required && (
                              <Badge variant="outline" className="text-[10px]">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Permit Required
                              </Badge>
                            )}
                            {job.climbing_required && (
                              <Badge variant="default" className="text-[10px] bg-primary">
                                <Mountain className="mr-1 h-3 w-3" />
                                Climbing Required
                              </Badge>
                            )}
                          </div>
                          {job.notes && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{job.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-accent">
                          ${Number(job.value).toLocaleString()}
                        </span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="urgent" className="mt-4">
            <div className="grid gap-4">
              {filteredJobs.filter((j) => j.status === "urgent").length === 0 && (
                <p className="text-muted-foreground text-center py-8">No urgent jobs</p>
              )}
              {filteredJobs
                .filter((j) => j.status === "urgent")
                .map((job) => (
                  <Card key={job.id} className="bg-card border-destructive">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <div>
                            <h3 className="font-semibold">{job.address}</h3>
                            <p className="text-sm text-muted-foreground">{job.notes}</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-accent">${Number(job.value).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="mt-4">
            <div className="grid gap-4">
              {filteredJobs.filter((j) => j.status === "quote").length === 0 && (
                <p className="text-muted-foreground text-center py-8">No pending quotes</p>
              )}
              {filteredJobs.filter((j) => j.status === "quote").map((job) => (
                <Card key={job.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{job.address}</h3>
                        <p className="text-sm text-muted-foreground">{job.customer_name} - {job.job_type}</p>
                      </div>
                      <span className="text-xl font-bold text-accent">${Number(job.value).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-4">
            <div className="grid gap-4">
              {filteredJobs.filter((j) => j.status === "scheduled").length === 0 && (
                <p className="text-muted-foreground text-center py-8">No scheduled jobs</p>
              )}
              {filteredJobs.filter((j) => j.status === "scheduled").map((job) => (
                <Card key={job.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{job.address}</h3>
                        <p className="text-sm text-muted-foreground">{job.customer_name} - {job.job_type}</p>
                      </div>
                      <span className="text-xl font-bold text-accent">${Number(job.value).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <div className="grid gap-4">
              {filteredJobs.filter((j) => j.status === "completed").length === 0 && (
                <p className="text-muted-foreground text-center py-8">No completed jobs</p>
              )}
              {filteredJobs.filter((j) => j.status === "completed").map((job) => (
                <Card key={job.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{job.address}</h3>
                        <p className="text-sm text-muted-foreground">{job.customer_name} - {job.job_type}</p>
                      </div>
                      <span className="text-xl font-bold text-accent">${Number(job.value).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
