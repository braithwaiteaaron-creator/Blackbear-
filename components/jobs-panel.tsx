"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertTriangle,
  QrCode,
  Mountain,
  Image,
} from "lucide-react"
import { JobPhotoUpload } from "./job-photo-upload"

interface Job {
  id: number
  address: string
  customer: string
  type: string
  status: "quoted" | "scheduled" | "in-progress" | "completed" | "urgent"
  value: number
  permit: boolean
  clearance: boolean
  climbingRequired: boolean
  trees: string[]
  notes: string
  photos: number
  createdAt: string
}

interface JobsPanelProps {
  jobs?: Job[]
  isLoading?: boolean
}

export function JobsPanel({ jobs = [], isLoading = false }: JobsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewJobOpen, setIsNewJobOpen] = useState(false)
  const [newJobPhotos, setNewJobPhotos] = useState<File[]>([])

  // TODO: Replace with useJobs hook from @/lib/supabase/hooks
  // const { jobs, isLoading, createJob } = useJobs()

  const filteredJobs = jobs.filter(
    (job) =>
      job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "urgent":
        return "destructive"
      case "in-progress":
        return "default"
      case "scheduled":
        return "secondary"
      case "quoted":
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
              <DialogDescription>
                Enter job details to create a new quote for a customer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Property Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="address" placeholder="Enter address..." className="pl-9" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" placeholder="Customer name..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Job Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="removal">Tree Removal</SelectItem>
                      <SelectItem value="pruning">Pruning</SelectItem>
                      <SelectItem value="stump">Stump Grinding</SelectItem>
                      <SelectItem value="storm">Storm Damage</SelectItem>
                      <SelectItem value="install">Tree Installation</SelectItem>
                      <SelectItem value="camera">Security Camera Install</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Estimated Value</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="value" type="number" placeholder="0.00" className="pl-9" />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trees">Trees on Property</Label>
                <Input id="trees" placeholder="e.g., Large Oak, 2x Maple, Dead Pine..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Special instructions, access details, etc..." />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Add Photos
                </Button>
                <Button variant="outline" className="flex-1">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR
                </Button>
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
              <Button onClick={() => setIsNewJobOpen(false)}>Create Quote</Button>
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

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4">
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
                        <p className="text-sm text-muted-foreground">{job.customer}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {job.photos} photos
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {job.createdAt}
                          </span>
                          {job.permit && (
                            <Badge variant="outline" className="text-[10px]">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Permit Required
                            </Badge>
                          )}
                          {job.clearance && (
                            <Badge variant="outline" className="text-[10px]">
                              Clearance Needed
                            </Badge>
                          )}
                          {job.climbingRequired && (
                            <Badge variant="default" className="text-[10px] bg-primary">
                              <Mountain className="mr-1 h-3 w-3" />
                              Climbing Required
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{job.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-accent">
                        ${job.value.toLocaleString()}
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
                      <span className="text-xl font-bold text-accent">${job.value.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="mt-4">
          <p className="text-muted-foreground">Pending quotes will appear here.</p>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <p className="text-muted-foreground">Scheduled jobs will appear here.</p>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <p className="text-muted-foreground">Completed jobs will appear here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
