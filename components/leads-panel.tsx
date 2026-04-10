"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Plus,
  Search,
  TreeDeciduous,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  Loader2,
  DollarSign,
  Navigation,
  CheckCircle,
  Trash2,
  ArrowRight,
} from "lucide-react"
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
import { useLeads, useJobs, type Lead } from "@/lib/supabase/hooks"
import { toast } from "sonner"

export function LeadsPanel() {
  const { leads, loading, createLead, updateLead, deleteLead } = useLeads()
  const { createJob } = useJobs()
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null)
  const [convertingLead, setConvertingLead] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    source: "direct",
    priority: "warm",
    estimated_value: "",
    trees: "",
    properties: "1",
    notes: "",
  })

  const marketingStats = {
    instagram: { posts: 0, reach: 0, leads: leads.filter(l => l.source === "instagram").length },
    linkedin: { posts: 0, reach: 0, leads: leads.filter(l => l.source === "linkedin").length },
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.priority === "hot").length,
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === "converted").length / leads.length) * 100) : 0,
  }

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.address || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Please enter a name")
      return
    }

    setIsSubmitting(true)
    const { data, error } = await createLead({
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      source: formData.source,
      priority: formData.priority,
      estimated_value: parseFloat(formData.estimated_value) || 0,
      trees: parseInt(formData.trees) || 0,
      properties: parseInt(formData.properties) || 1,
      notes: formData.notes,
      status: "new",
    })
    setIsSubmitting(false)

    if (error) {
      toast.error("Failed to create lead")
    } else {
      toast.success("Lead added successfully!")
      setIsNewLeadOpen(false)
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        source: "direct",
        priority: "warm",
        estimated_value: "",
        trees: "",
        properties: "1",
        notes: "",
      })
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "instagram":
        return <Instagram className="h-4 w-4 text-pink-500" />
      case "linkedin":
        return <Linkedin className="h-4 w-4 text-blue-600" />
      case "referral":
        return <Users className="h-4 w-4 text-primary" />
      case "spotted":
        return <Eye className="h-4 w-4 text-yellow-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "hot":
        return "bg-destructive/10 border-destructive/20"
      case "warm":
        return "bg-yellow-500/10 border-yellow-500/20"
      default:
        return "bg-secondary/50 border-secondary"
    }
  }

  const handleCallLead = (lead: Lead) => {
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`
      toast.info(`Calling ${lead.name}...`)
    } else {
      toast.info("No phone number on record for this lead")
    }
  }

  const handleDirections = (lead: Lead) => {
    if (lead.address) {
      const encodedAddress = encodeURIComponent(lead.address)
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank")
    } else {
      toast.info("No address on record for this lead")
    }
  }

  const handleConvertToJob = async (lead: Lead) => {
    setConvertingLead(lead.id)
    
    // Create a new job from the lead
    const { error: jobError } = await createJob({
      address: lead.address || "TBD",
      customer_name: lead.name,
      job_type: "Tree Removal",
      value: lead.estimated_value || 0,
      trees: [],
      notes: `Converted from lead. ${lead.notes || ""} Phone: ${lead.phone || "N/A"}`,
      permit_required: false,
      climbing_required: false,
      status: "quote",
    })

    if (jobError) {
      toast.error("Failed to create job from lead")
      setConvertingLead(null)
      return
    }

    // Update lead status
    const { error: leadError } = await updateLead(lead.id, { status: "converted" })
    
    setConvertingLead(null)
    
    if (leadError) {
      toast.warning("Job created but failed to update lead status")
    } else {
      toast.success(`${lead.name} converted to job!`)
    }
  }

  const handleDeleteLead = async () => {
    if (!deleteLeadId) return
    const { error } = await deleteLead(deleteLeadId)
    if (error) {
      toast.error("Failed to delete lead")
    } else {
      toast.success("Lead deleted")
    }
    setDeleteLeadId(null)
  }

  const handleUpdatePriority = async (lead: Lead, priority: string) => {
    const { error } = await updateLead(lead.id, { priority })
    if (error) {
      toast.error("Failed to update priority")
    } else {
      toast.success(`Priority updated to ${priority}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{marketingStats.totalLeads}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">{marketingStats.hotLeads}</p>
              <p className="text-sm text-muted-foreground">Hot Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{marketingStats.instagram.leads}</p>
              <p className="text-sm text-muted-foreground">Instagram</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{marketingStats.linkedin.leads}</p>
              <p className="text-sm text-muted-foreground">LinkedIn</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{marketingStats.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Conversion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Leads</h3>
        <Dialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Enter details for a potential customer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Customer name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="address" 
                    placeholder="Property address..." 
                    className="pl-9"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Source</Label>
                  <Select 
                    value={formData.source}
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="spotted">Spotted</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select 
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="value">Est. Value</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="value" 
                      type="number"
                      placeholder="0"
                      className="pl-9"
                      value={formData.estimated_value}
                      onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trees">Trees</Label>
                  <Input 
                    id="trees" 
                    type="number"
                    placeholder="0"
                    value={formData.trees}
                    onChange={(e) => setFormData({ ...formData, trees: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="properties">Properties</Label>
                  <Input 
                    id="properties" 
                    type="number"
                    placeholder="1"
                    value={formData.properties}
                    onChange={(e) => setFormData({ ...formData, properties: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="How did you find this lead? Any details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewLeadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search leads by name or address..."
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
            <TabsTrigger value="all">All Leads</TabsTrigger>
            <TabsTrigger value="hot">Hot</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="follow-up">Follow Up</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4">
              {filteredLeads.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-muted-foreground">No leads yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Tap "Add Lead" to start tracking potential customers</p>
                </div>
              )}
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className={`border ${getPriorityColor(lead.priority)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          {getSourceIcon(lead.source)}
                        </div>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {lead.address && (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span>{lead.address}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            {lead.trees > 0 && <span>{lead.trees} trees</span>}
                            {lead.properties > 0 && <span>{lead.properties} properties</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last contact: {lead.last_contact ? new Date(lead.last_contact).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg">
                            ${Number(lead.estimated_value || 0).toLocaleString()}
                          </p>
                          <Badge>{lead.priority}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleCallLead(lead)}>
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDirections(lead)}>
                            <Navigation className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleConvertToJob(lead)}
                            disabled={convertingLead === lead.id || lead.status === "converted"}
                          >
                            {convertingLead === lead.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Convert
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setDeleteLeadId(lead.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hot" className="mt-4">
            <div className="grid gap-4">
              {leads
                .filter(l => l.priority === "hot")
                .map((lead) => (
                  <Card key={lead.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.address}</p>
                        </div>
                        <Badge variant="destructive">Hot</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <p className="text-muted-foreground">New leads will appear here.</p>
          </TabsContent>

          <TabsContent value="follow-up" className="mt-4">
            <p className="text-muted-foreground">Leads requiring follow-up will appear here.</p>
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteLeadId} onOpenChange={() => setDeleteLeadId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this lead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLead} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
