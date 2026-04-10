"use client"

import { useState } from "react"
import { Bell, Menu, Mail, Search, Phone, MapPin, X } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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

  // Get pending quotes for notifications
  const pendingQuotes = jobs.filter(j => j.status === "quote")
  const hotLeads = leads.filter(l => l.priority === "hot")
  const notificationCount = pendingQuotes.length + hotLeads.length

  // Search results
  const searchResults = searchQuery.length > 1 ? {
    jobs: jobs.filter(j => 
      (j.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
    toast.info("Opening email client...")
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
          {/* Search Results Dropdown */}
          {searchOpen && (searchResults.jobs.length > 0 || searchResults.leads.length > 0) && (
            <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.jobs.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Jobs</p>
                  {searchResults.jobs.map(job => (
                    <button
                      key={job.id}
                      className="w-full text-left px-3 py-2 hover:bg-secondary rounded-md"
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery("")
                        toast.info(`${job.address} - ${job.status}`)
                      }}
                    >
                      <p className="font-medium text-sm">{job.address}</p>
                      <p className="text-xs text-muted-foreground">{job.customer_name} - ${job.value}</p>
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
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery("")
                        toast.info(`${lead.name} - ${lead.priority} priority`)
                      }}
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
        {/* Mobile search button */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowMobileSearch(true)}>
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Email Quick Access */}
        <Button variant="ghost" size="icon" className="relative" onClick={handleEmail}>
          <Mail className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications ({notificationCount})</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pendingQuotes.length > 0 && (
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="font-medium">{pendingQuotes.length} Pending Quotes</span>
                <span className="text-xs text-muted-foreground">
                  {pendingQuotes[0]?.address} {pendingQuotes.length > 1 ? `+${pendingQuotes.length - 1} more` : ""}
                </span>
              </DropdownMenuItem>
            )}
            {hotLeads.length > 0 && (
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="font-medium text-destructive">{hotLeads.length} Hot Leads</span>
                <span className="text-xs text-muted-foreground">
                  {hotLeads[0]?.name} needs follow-up
                </span>
              </DropdownMenuItem>
            )}
            {notificationCount === 0 && (
              <DropdownMenuItem className="text-muted-foreground">
                No new notifications
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
                  onClick={() => {
                    setShowMobileSearch(false)
                    setSearchQuery("")
                    toast.info(`${job.address} - ${job.status}`)
                  }}
                >
                  <p className="font-medium text-sm">{job.address}</p>
                  <p className="text-xs text-muted-foreground">{job.customer_name}</p>
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
                  onClick={() => {
                    setShowMobileSearch(false)
                    setSearchQuery("")
                    toast.info(`${lead.name} - ${lead.priority}`)
                  }}
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
