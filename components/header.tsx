"use client"

import { Bell, Menu, Mail, Search, TreeDeciduous } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
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
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Email Quick Access */}
        <Button variant="ghost" size="icon" className="relative">
          <Mail className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            3
          </span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                5
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="font-medium">New Quote Request</span>
              <span className="text-xs text-muted-foreground">123 Oak Street - Large oak removal</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="font-medium">E-Transfer Received</span>
              <span className="text-xs text-muted-foreground">$850.00 from Johnson Family</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="font-medium text-destructive">Weather Alert</span>
              <span className="text-xs text-muted-foreground">High winds expected tomorrow</span>
            </DropdownMenuItem>
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
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>blackbeartrees27@gmail.com</DropdownMenuItem>
            <DropdownMenuItem className="text-primary font-medium">647-764-9017</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
