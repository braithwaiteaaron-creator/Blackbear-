"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  TreeDeciduous,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
} from "lucide-react"

interface Lead {
  id: number
  name: string
  address: string
  phone: string
  email: string
  source: "instagram" | "linkedin" | "referral" | "spotted" | "website"
  status: "new" | "contacted" | "quoted" | "follow-up" | "converted" | "lost"
  value: number
  trees: number
  properties: number
  notes: string
  lastContact: string
  priority: "hot" | "warm" | "cold"
}

const marketingStats = {
  instagram: { posts: 0, reach: 0, leads: 0 },
  linkedin: { posts: 0, reach: 0, leads: 0 },
  totalLeads: 0,
  hotLeads: 0,
  conversionRate: 0,
}

export function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([])
  // TODO: Replace with useLeads hook from @/lib/supabase/hooks
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSourceIcon = (source: Lead["source"]) => {
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

  const getPriorityColor = (priority: Lead["priority"]) => {
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
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

      {/* Tabs */}
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
                            Last contact: {lead.lastContact}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-accent">
                        ${lead.value.toLocaleString()}
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
                        ${lead.value.toLocaleString()}
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
