"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DashboardOverview } from "@/components/dashboard-overview"
import { JobsPanel } from "@/components/jobs-panel"
import { LeadsPanel } from "@/components/leads-panel"
import { RoutePanel } from "@/components/route-panel"
import { AgentsPanel } from "@/components/agents-panel"
import { FinancialsPanel } from "@/components/financials-panel"
import { MerchPanel } from "@/components/merch-panel"
import { ReferralPanel } from "@/components/referral-panel"
import { WeatherAlerts } from "@/components/weather-alerts"
import { VoiceCommand } from "@/components/voice-command"

export type ActiveView = "dashboard" | "jobs" | "leads" | "routes" | "agents" | "financials" | "merch" | "referrals"

export default function BearHubPro() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardOverview onNavigate={setActiveView} />
      case "jobs":
        return <JobsPanel />
      case "leads":
        return <LeadsPanel />
      case "routes":
        return <RoutePanel />
      case "agents":
        return <AgentsPanel />
      case "financials":
        return <FinancialsPanel />
      case "merch":
        return <MerchPanel />
      case "referrals":
        return <ReferralPanel />
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
          <WeatherAlerts />
          {renderContent()}
        </main>
        <VoiceCommand 
          onCommand={(command, address) => {
            switch (command) {
              case "quote":
                setActiveView("jobs")
                break
              case "damage":
                setActiveView("routes")
                break
              case "route":
              case "route-plan":
                setActiveView("routes")
                break
              case "weather":
                // Weather alerts are already visible at top
                break
              case "follow-up":
                setActiveView("leads")
                break
            }
          }}
        />
      </div>
    </div>
  )
}
