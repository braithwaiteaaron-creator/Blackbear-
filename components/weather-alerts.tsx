"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Wind, Zap, X, Cloud, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getWeatherAlerts } from "@/lib/weather/openweather"

interface WeatherAlert {
  event: string
  start: number
  end: number
  severity: "low" | "moderate" | "high"
  description?: string
}

export function WeatherAlerts() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchAlerts, 900000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const weatherAlerts = await getWeatherAlerts()
      setAlerts(weatherAlerts)
    } catch (error) {
      console.error("Failed to fetch weather alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = (event: string) => {
    setDismissedAlerts((prev) => new Set([...prev, event]))
  }

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.event))

  if (visibleAlerts.length === 0) return null

  return (
    <div className="mb-4 space-y-2">
      {visibleAlerts.map((alert) => (
        <Alert
          key={alert.event}
          variant={alert.severity === "high" ? "destructive" : "default"}
          className={
            alert.severity === "moderate"
              ? "border-accent/50 bg-accent/10 text-foreground"
              : alert.severity === "high"
                ? "border-destructive bg-destructive/10"
                : ""
          }
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              {alert.event.includes("Wind") && <Wind className="h-5 w-5 text-accent" />}
              {alert.event.includes("Lightning") && <Zap className="h-5 w-5 text-destructive" />}
              {alert.event.includes("Thunderstorm") && <Cloud className="h-5 w-5 text-destructive" />}
              <div>
                <AlertTitle className="font-semibold">{alert.event}</AlertTitle>
                <AlertDescription className="text-sm text-muted-foreground">
                  {alert.description || "Active weather alert in your area"}
                </AlertDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  Severity: <span className="font-medium capitalize">{alert.severity}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => dismissAlert(alert.event)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
      {visibleAlerts.length > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2"
          onClick={fetchAlerts}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Weather"}
        </Button>
      )}
    </div>
  )
}
