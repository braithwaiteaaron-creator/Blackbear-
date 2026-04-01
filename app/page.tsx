"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DashboardOverview } from "@/components/dashboard-overview"
import { JobsPanel } from "@/components/jobs-panel"
import { CustomersPanel } from "@/components/customers-panel"
import { SchedulePanel } from "@/components/schedule-panel"
import { ReferralsPanel } from "@/components/referrals-panel"
import { VoiceCommand } from "@/components/voice-command"

export type ActiveView = "dashboard" | "jobs" | "customers" | "schedule" | "referrals"

export default function BearHubPro() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardOverview onNavigate={setActiveView} />
      case "jobs":
        return <JobsPanel />
      case "customers":
        return <CustomersPanel />
      case "schedule":
        return <SchedulePanel />
      case "referrals":
        return <ReferralsPanel />
      default:
        return <DashboardOverview onNavigate={setActiveView} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </main>
        <VoiceCommand 
          onCommand={(command) => {
            switch (command) {
              case "quote":
                setActiveView("jobs")
                break
              case "follow-up":
                setActiveView("jobs")
                break
              case "schedule":
                setActiveView("schedule")
                break
              case "customers":
                setActiveView("customers")
                break
            }
          }}
        />
      </div>
    </div>
  )
}
