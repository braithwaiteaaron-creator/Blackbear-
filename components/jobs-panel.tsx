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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  Phone,
  Navigation,
  CheckCircle,
  Trash2,
  Edit,
  Calendar,
} from "lucide-react"
import { JobPhotoUpload } from "./job-photo-upload"
import { useJobs, useReferrers, type Job } from "@/lib/supabase/hooks"
import { toast } from "sonner"

export function JobsPanel() {
  const { jobs, loading, createJob, updateJob, deleteJob } = useJobs()
  const { referrers } = useReferrers()
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewJobOpen, setIsNewJobOpen] = useState(false)
  const [newJobPhotos, setNewJobPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  
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

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    description: "",
    service_type: "",
    address: "",
    estimated_amount: "",
    status: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
  })

  const filteredJobs = jobs.filter(
    (job) =>
      (job.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.service_type || "").toLowerCase().includes(searchQuery.toLowerCase())
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

    // Build notes with phone and referral info
    let notesContent = formData.notes
    if (formData.customer_phone) {
      notesContent = `Phone: ${formData.customer_phone}. ${notesContent}`
    }
    if (matchedReferrer) {
      notesContent += ` [Referral: ${matchedReferrer.name}]`
    }

    const { data, error } = await createJob({
      description: `${formData.job_type} at ${formData.address}`,
      service_type: formData.job_type,
      status: "quote",
      address: formData.address,
      estimated_amount: parseFloat(formData.value) || 0,
      notes: notesContent,
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

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setIsDetailsOpen(true)
  }

  const handleEditJob = (job: Job) => {
    setSelectedJob(job)
    // Extract time from time_started_at or default to empty
    const scheduledTime = job.time_started_at ? job.time_started_at.substring(11, 16) : ""
    setEditFormData({
      description: job.description,
      service_type: job.service_type,
      address: job.address || "",
      estimated_amount: (job.estimated_amount || 0).toString(),
      status: job.status,
      scheduled_date: job.scheduled_date ? job.scheduled_date.split("T")[0] : "",
      scheduled_time: scheduledTime,
      notes: job.notes || "",
    })
    setIsEditOpen(true)
  }

  const handleUpdateJob = async () => {
    if (!selectedJob) return
    setIsSubmitting(true)
    
    // Build time_started_at from date and time if both exist
    let timeStartedAt = null
    if (editFormData.scheduled_date && editFormData.scheduled_time) {
      timeStartedAt = `${editFormData.scheduled_date}T${editFormData.scheduled_time}:00`
    }
    
    const { error } = await updateJob(selectedJob.id, {
      description: editFormData.description,
      service_type: editFormData.service_type,
      address: editFormData.address,
      estimated_amount: parseFloat(editFormData.estimated_amount) || 0,
      status: editFormData.status,
      scheduled_date: editFormData.scheduled_date || null,
      time_started_at: timeStartedAt,
      notes: editFormData.notes,
    })
    setIsSubmitting(false)
    if (error) {
      toast.error("Failed to update job")
    } else {
      toast.success("Job updated successfully")
      setIsEditOpen(false)
      setSelectedJob(null)
    }
  }

  const handleDeleteJob = async () => {
    if (!deleteJobId) return
    const { error } = await deleteJob(deleteJobId)
    if (error) {
      toast.error("Failed to delete job")
    } else {
      toast.success("Job deleted")
    }
    setDeleteJobId(null)
  }

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const { error } = await updateJob(jobId, { status: newStatus })
    if (error) {
      toast.error("Failed to update status")
    } else {
      toast.success(`Status updated to ${newStatus}`)
    }
  }

  const handleCall = (job: Job) => {
    // Try to find a phone number in notes or use a default
    const phoneMatch = job.notes?.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)
    if (phoneMatch) {
      window.location.href = `tel:${phoneMatch[0]}`
    } else {
      toast.info("No phone number found for this customer")
    }
  }

  const handleDirections = (job: Job) => {
    if (!job.address) {
      toast.info("No address available for this job")
      return
    }
    const encodedAddress = encodeURIComponent(job.address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank")
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
                          <p className="text-sm text-muted-foreground">{job.description}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {job.service_type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(job.created_at || "").toLocaleDateString()} at {new Date(job.created_at || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {job.scheduled_date && (
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              <Calendar className="h-3 w-3" />
                              {new Date(job.scheduled_date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                              {job.time_started_at && (
                                <span className="ml-1">{new Date(job.time_started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              )}
                            </div>
                          )}
                          {job.notes && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{job.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-accent">
                          ${Number(job.estimated_amount || 0).toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleCall(job)}>
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDirections(job)}>
                            <Navigation className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(job)}>
                            View Details
                          </Button>
                        </div>
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
                        <span className="text-xl font-bold text-accent">${Number(job.estimated_amount || 0).toLocaleString()}</span>
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
                <Card key={job.id} className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleViewDetails(job)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{job.address}</h3>
                        <p className="text-sm text-muted-foreground">{job.service_type}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Quote received: {new Date(job.created_at || "").toLocaleDateString()} at {new Date(job.created_at || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-accent">${Number(job.estimated_amount || 0).toLocaleString()}</span>
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
                <Card key={job.id} className="bg-card border-primary/30 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleViewDetails(job)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{job.address}</h3>
                        <p className="text-sm text-muted-foreground">{job.service_type}</p>
                        {job.scheduled_date && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            <Calendar className="h-3 w-3" />
                            {new Date(job.scheduled_date).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })}
                            {job.time_started_at && (
                              <span className="ml-1 border-l border-primary/30 pl-1.5">
                                {new Date(job.time_started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xl font-bold text-accent">${Number(job.estimated_amount || 0).toLocaleString()}</span>
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
                        <p className="text-sm text-muted-foreground">{job.description} - {job.service_type}</p>
                      </div>
                      <span className="text-xl font-bold text-accent">${Number(job.estimated_amount || 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Job Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              {selectedJob?.address}
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium">{selectedJob.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusColor(selectedJob.status)} className="capitalize">{selectedJob.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Amount</p>
                  <p className="font-bold text-accent">${Number(selectedJob.estimated_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quote Received</p>
                  <p className="font-medium">{new Date(selectedJob.created_at || "").toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(selectedJob.created_at || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
              
              {/* Scheduled Date & Time */}
              {selectedJob.scheduled_date && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">Scheduled</p>
                  </div>
                  <p className="font-semibold text-lg">{new Date(selectedJob.scheduled_date).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}</p>
                  {selectedJob.time_started_at && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedJob.time_started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              )}
              
              {selectedJob.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1 p-2 bg-secondary rounded">{selectedJob.notes}</p>
                </div>
              )}

              {/* Quick Status Change */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {["quote", "scheduled", "in_progress", "completed", "urgent"].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedJob.status === status ? "default" : "outline"}
                      onClick={() => {
                        handleStatusChange(selectedJob.id, status)
                        setSelectedJob({ ...selectedJob, status })
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => handleCall(selectedJob)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleDirections(selectedJob)}>
                  <Navigation className="mr-2 h-4 w-4" />
                  Directions
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setIsDetailsOpen(false)
                  handleEditJob(selectedJob)
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Job
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  setIsDetailsOpen(false)
                  setDeleteJobId(selectedJob.id)
                }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update job details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Service Type</Label>
                <Select
                  value={editFormData.service_type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="edit-amount">Estimated Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="edit-amount"
                    type="number"
                    className="pl-9"
                    value={editFormData.estimated_amount}
                    onChange={(e) => setEditFormData({ ...editFormData, estimated_amount: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editFormData.status === "scheduled" && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Job
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-scheduled-date" className="text-xs">Date</Label>
                    <Input
                      id="edit-scheduled-date"
                      type="date"
                      value={editFormData.scheduled_date}
                      onChange={(e) => setEditFormData({ ...editFormData, scheduled_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-scheduled-time" className="text-xs">Time</Label>
                    <Input
                      id="edit-scheduled-time"
                      type="time"
                      value={editFormData.scheduled_time}
                      onChange={(e) => setEditFormData({ ...editFormData, scheduled_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                rows={3}
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateJob} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this job and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
