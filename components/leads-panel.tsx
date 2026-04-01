"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"
import { useLeads } from "@/lib/supabase/hooks"
import { toast } from "sonner"

export function LeadsPanel() {
  const { leads, loading, createLead } = useLeads()
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
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
        return <Instagram className="h-4 w-4" />
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "spotted":
        return <Eye className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "hot":
        return "destructive"
      case "warm":
        return "default"
      case "cold":
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
          <h1 className="text-2xl font-bold">Lead Generator</h1>
          <p className="text-muted-foreground">Track and manage potential customers</p>
        </div>
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

      {/* Marketing Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                <Instagram className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instagram</p>
                <p className="text-xl font-bold">{marketingStats.instagram.leads} leads</p>
                <p className="text-xs text-muted-foreground">
                  {marketingStats.instagram.reach.toLocaleString()} reach
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Linkedin className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LinkedIn</p>
                <p className="text-xl font-bold">{marketingStats.linkedin.leads} leads</p>
                <p className="text-xs text-muted-foreground">
                  {marketingStats.linkedin.reach.toLocaleString()} reach
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-xl font-bold">{marketingStats.hotLeads}</p>
                <p className="text-xs text-muted-foreground">Ready to convert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">{marketingStats.conversionRate}%</p>
                <Progress value={marketingStats.conversionRate} className="mt-1 h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                <p className="text-sm text-muted-foreground mt-1">Tap &quot;Add Lead&quot; to start tracking potential customers</p>
              </div>
            )}
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        {getSourceIcon(lead.source)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{lead.name}</h3>
                          <Badge variant={getPriorityColor(lead.priority)}>{lead.priority}</Badge>
                          <Badge variant="outline">{lead.status}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lead.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <TreeDeciduous className="h-3 w-3" />
                            {lead.trees} trees
                          </span>
                          {lead.properties > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {lead.properties} properties
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{lead.notes}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last contact: {lead.last_contact ? new Date(lead.last_contact).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-accent">
                        ${Number(lead.estimated_value || 0).toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="mr-1 h-3 w-3" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Message
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
            {filteredLeads
              .filter((l) => l.priority === "hot")
              .map((lead) => (
                <Card key={lead.id} className="bg-card border-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{lead.name}</h3>
                        <p className="text-sm text-muted-foreground">{lead.notes}</p>
                      </div>
                      <span className="text-xl font-bold text-accent">
                        ${Number(lead.estimated_value || 0).toLocaleString()}
                      </span>
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
    </div>
  )
}
