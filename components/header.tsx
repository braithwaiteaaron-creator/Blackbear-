"use client"

import { useState } from "react"
import { Bell, Menu, Mail, Search, Phone, X, Briefcase, Users, AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { useJobs, useLeads } from "@/lib/supabase/hooks"
import { toast } from "sonner"

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { jobs } = useJobs()
  const { leads } = useLeads()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showInbox, setShowInbox] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [inboxTab, setInboxTab] = useState<"messages" | "activity">("messages")

  // Real data for alerts
  const pendingQuotes = jobs.filter(j => j.status === "quote")
  const activeJobs = jobs.filter(j => j.status === "active" || j.status === "in_progress")
  const completedJobs = jobs.filter(j => j.status === "completed")
  const hotLeads = leads.filter(l => l.priority === "hot")
  const newLeads = leads.filter(l => l.status === "new")
  const notificationCount = pendingQuotes.length + hotLeads.length + newLeads.length
  const inboxCount = leads.filter(l => l.status === "new").length

  // Search results using correct field names
  const searchResults = searchQuery.length > 1 ? {
    jobs: jobs.filter(j =>
      (j.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.service_type || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5),
    leads: leads.filter(l =>
      (l.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.address || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  } : { jobs: [], leads: [] }

  const handleCall = () => {
    window.location.href = "tel:647-764-9017"
  }

  const handleEmail = () => {
    window.location.href = "mailto:blackbeartrees27@gmail.com"
  }

  return (
    <>
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuToggle}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2 lg:hidden">
          <Image
            src="/images/logo-seal.png"
            alt="Black Bear Tree Care"
            width={32}
            height={32}
            className="rounded-full"
            style={{ width: 32, height: 32 }}
          />
          <span className="font-bold text-foreground">Bear Hub</span>
        </div>
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs, customers, addresses..."
            className="w-80 bg-secondary pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchOpen(e.target.value.length > 1)
            }}
            onFocus={() => searchQuery.length > 1 && setSearchOpen(true)}
          />
          {searchOpen && (searchResults.jobs.length > 0 || searchResults.leads.length > 0) && (
            <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.jobs.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Jobs</p>
                  {searchResults.jobs.map(job => (
                    <button
                      key={job.id}
                      className="w-full text-left px-3 py-2 hover:bg-secondary rounded-md"
                      onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                    >
                      <p className="font-medium text-sm">{job.address}</p>
                      <p className="text-xs text-muted-foreground">{job.service_type} - {job.status}</p>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.leads.length > 0 && (
                <div className="p-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Leads</p>
                  {searchResults.leads.map(lead => (
                    <button
                      key={lead.id}
                      className="w-full text-left px-3 py-2 hover:bg-secondary rounded-md"
                      onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                    >
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.address}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowMobileSearch(true)}>
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {/* Inbox */}
        <Button variant="ghost" size="icon" className="relative" onClick={() => setShowInbox(true)}>
          <Mail className="h-5 w-5" />
          {inboxCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
              {inboxCount > 9 ? "9+" : inboxCount}
            </span>
          )}
        </Button>

        {/* Alerts */}
        <Button variant="ghost" size="icon" className="relative" onClick={() => setShowAlerts(true)}>
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/images/owner-climbing.jpg" alt="Owner" className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground">BB</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Black Bear Tree Care</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEmail}>
              <Mail className="h-4 w-4 mr-2" />
              blackbeartrees27@gmail.com
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCall} className="text-primary font-medium">
              <Phone className="h-4 w-4 mr-2" />
              647-764-9017
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Profile settings coming soon!")}>
              Profile Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    {/* Inbox Sheet */}
    <Sheet open={showInbox} onOpenChange={setShowInbox}>
      <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">Inbox</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowInbox(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-2 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setInboxTab("messages")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${inboxTab === "messages" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              New Leads
              {newLeads.length > 0 && <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{newLeads.length}</span>}
            </button>
            <button
              onClick={() => setInboxTab("activity")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${inboxTab === "activity" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Activity
            </button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {inboxTab === "messages" && (
            <div className="p-4 space-y-3">
              {newLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">No new leads</p>
                  <p className="text-sm text-muted-foreground mt-1">New leads will appear here</p>
                </div>
              ) : (
                newLeads.map(lead => (
                  <div key={lead.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{lead.name}</p>
                        <Badge variant={lead.priority === "hot" ? "destructive" : "outline"} className="text-[10px] shrink-0">
                          {lead.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{lead.address || "No address"}</p>
                      {lead.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lead.notes}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1 text-xs text-primary font-medium"
                            onClick={e => e.stopPropagation()}
                          >
                            <Phone className="h-3 w-3" />
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {inboxTab === "activity" && (
            <div className="p-4 space-y-3">
              {jobs.length === 0 && leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="font-medium text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <>
                  {[...jobs].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10).map(job => (
                    <div key={job.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary">
                      <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{job.address || job.description}</p>
                        <p className="text-xs text-muted-foreground">{job.service_type} &middot; <span className="capitalize">{job.status}</span></p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(job.created_at || "").toLocaleDateString()}</p>
                      </div>
                      <Badge variant={job.status === "completed" ? "secondary" : "outline"} className="text-[10px] shrink-0 capitalize">
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick contact footer */}
        <div className="p-4 border-t border-border flex gap-2">
          <Button className="flex-1" onClick={handleCall}>
            <Phone className="h-4 w-4 mr-2" />
            Call Office
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    {/* Alerts Sheet */}
    <Sheet open={showAlerts} onOpenChange={setShowAlerts}>
      <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">Alerts</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAlerts(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notificationCount} items need attention</p>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">

            {/* Hot Leads */}
            {hotLeads.length > 0 && (
              <div>
                <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">Hot Leads - Act Now</p>
                {hotLeads.map(lead => (
                  <div key={lead.id} className="flex items-start gap-3 p-3 rounded-xl border border-destructive/30 bg-destructive/5 mb-2">
                    <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.address || "No address"}</p>
                      {lead.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lead.notes}</p>}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 mt-1.5 text-xs text-destructive font-semibold">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}

            {/* Pending Quotes */}
            {pendingQuotes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-2">Pending Quotes - Follow Up</p>
                {pendingQuotes.map(job => (
                  <div key={job.id} className="flex items-start gap-3 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 mb-2">
                    <div className="h-9 w-9 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{job.address || job.description}</p>
                      <p className="text-xs text-muted-foreground">{job.service_type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(job.created_at || "").toLocaleDateString()}</p>
                      {job.estimated_amount && (
                        <p className="text-sm font-bold text-accent mt-1">${Number(job.estimated_amount).toLocaleString()}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}

            {/* Active Jobs */}
            {activeJobs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Active Jobs</p>
                {activeJobs.map(job => (
                  <div key={job.id} className="flex items-start gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5 mb-2">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{job.address || job.description}</p>
                      <p className="text-xs text-muted-foreground">{job.service_type}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}

            {/* New Leads */}
            {newLeads.length > 0 && (
              <div>
                <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">New Leads</p>
                {newLeads.map(lead => (
                  <div key={lead.id} className="flex items-start gap-3 p-3 rounded-xl border border-accent/20 bg-accent/5 mb-2">
                    <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.address || "No address"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}

            {/* Completed Jobs Summary */}
            {completedJobs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Completed</p>
                <div className="p-3 rounded-xl border border-border bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{completedJobs.length} jobs completed</p>
                      <p className="text-xs text-muted-foreground">Great work!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {notificationCount === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="font-medium">All clear!</p>
                <p className="text-sm text-muted-foreground mt-1">No alerts right now</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>

    {/* Mobile Search Dialog */}
    <Dialog open={showMobileSearch} onOpenChange={setShowMobileSearch}>
      <DialogContent className="top-4 translate-y-0 max-w-lg">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs, customers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
        {searchResults.jobs.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Jobs</p>
            {searchResults.jobs.map(job => (
              <button
                key={job.id}
                className="w-full text-left px-3 py-2 hover:bg-secondary rounded-md mb-1"
                onClick={() => { setShowMobileSearch(false); setSearchQuery("") }}
              >
                <p className="font-medium text-sm">{job.address}</p>
                <p className="text-xs text-muted-foreground">{job.service_type}</p>
              </button>
            ))}
          </div>
        )}
        {searchResults.leads.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Leads</p>
            {searchResults.leads.map(lead => (
              <button
                key={lead.id}
                className="w-full text-left px-3 py-2 hover:bg-secondary rounded-md mb-1"
                onClick={() => { setShowMobileSearch(false); setSearchQuery("") }}
              >
                <p className="font-medium text-sm">{lead.name}</p>
                <p className="text-xs text-muted-foreground">{lead.address}</p>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
