"use client"

import { cn } from "@/lib/utils"
import type { ActiveView } from "@/app/page"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MapPin,
  X,
  ExternalLink,
  Star,
  Youtube,
  QrCode,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface SidebarProps {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "jobs" as const, label: "Jobs & Quotes", icon: Briefcase },
  { id: "customers" as const, label: "Customers", icon: Users },
  { id: "schedule" as const, label: "Schedule", icon: MapPin },
  { id: "referrals" as const, label: "Referrals", icon: Gift },
]

export function Sidebar({ activeView, setActiveView, isOpen, onToggle }: SidebarProps) {
  const handleNavClick = (id: ActiveView) => {
    setActiveView(id)
    onToggle() // Close sidebar on mobile after selection
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo + Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/logo-seal.png" 
              alt="Black Bear Tree Care" 
              width={44} 
              height={44}
              className="rounded-full"
              style={{ width: 44, height: 44 }}
            />
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground">Bear Hub</span>
              <span className="text-xs text-primary">PRO</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="lg:hidden text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                activeView === item.id
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Quick Links */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-2 mb-2">QUICK LINKS</p>
          <a
            href="https://www.google.com/search?q=black+bear+tree+care+ontario+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent/50 transition-colors"
          >
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Google Reviews</span>
            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
          </a>
          <a
            href="https://www.yelp.ca/biz/black-bear-tree-care"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent/50 transition-colors"
          >
            <span className="flex items-center gap-0.5 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
            </span>
            <span>Yelp</span>
            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
          </a>
          <a
            href="https://www.youtube.com/@OntarioFirewoodResource"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent/50 transition-colors"
          >
            <Youtube className="h-4 w-4 text-red-500" />
            <span>YouTube Channel</span>
            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
          </a>
          <a
            href="https://blackbeartreecare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent/50 transition-colors"
          >
            <QrCode className="h-4 w-4 text-primary" />
            <span>Website QR</span>
            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
          </a>
        </div>

        {/* Company Info */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-sm font-bold text-sidebar-foreground">Black Bear Tree Care</p>
          <p className="text-xs font-medium text-primary">We Go Above and Beyond</p>
          <p className="text-[10px] text-muted-foreground mt-1 italic">We climb where others can&apos;t</p>
          <div className="mt-2 pt-2 border-t border-sidebar-border/50">
            <p className="text-xs text-muted-foreground">Ontario, Canada - Est. 2021</p>
            <p className="text-xs text-muted-foreground">blackbeartrees27@gmail.com</p>
            <p className="text-xs font-bold text-primary mt-1">24/7: 647-764-9017</p>
          </div>
        </div>
      </aside>
    </>
  )
}
