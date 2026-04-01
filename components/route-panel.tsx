"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Navigation,
  TreeDeciduous,
  AlertTriangle,
  Clock,
  Zap,
  Camera,
  Route,
  Plus,
  Play,
  ExternalLink,
} from "lucide-react"

interface RouteStop {
  id: number
  address: string
  type: "quote" | "job" | "follow-up" | "damage-spotted"
  time?: string
  notes: string
  priority: "high" | "medium" | "low"
  photos?: number
}

const todayRoute: RouteStop[] = [
  {
    id: 1,
    address: "567 Birch Drive",
    type: "quote",
    time: "9:00 AM",
    notes: "New quote - 3 trees need assessment",
    priority: "high",
  },
  {
    id: 2,
    address: "456 Maple Avenue",
    type: "job",
    time: "11:30 AM",
    notes: "Tree removal - In Progress",
    priority: "high",
  },
  {
    id: 3,
    address: "890 Willow Court",
    type: "follow-up",
    time: "2:00 PM",
    notes: "Follow up with Sarah Mitchell - hot lead",
    priority: "medium",
  },
  {
    id: 4,
    address: "234 Elm Street",
    type: "quote",
    time: "3:30 PM",
    notes: "Spotted overgrown oak - give estimate",
    priority: "medium",
    photos: 2,
  },
]

const spottedDamage: RouteStop[] = [
  {
    id: 101,
    address: "123 Storm Lane",
    type: "damage-spotted",
    notes: "Large branch down - blocking driveway",
    priority: "high",
    photos: 3,
  },
  {
    id: 102,
    address: "456 Wind Road",
    type: "damage-spotted",
    notes: "Split trunk on mature oak - hazard",
    priority: "high",
    photos: 2,
  },
  {
    id: 103,
    address: "789 Gust Avenue",
    type: "damage-spotted",
    notes: "Overgrown hedge - visibility issue at intersection",
    priority: "medium",
    photos: 1,
  },
]

export function RoutePanel() {
  const [stormChaseMode, setStormChaseMode] = useState(false)

  const openInMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank")
  }

  const startNavigation = () => {
    // Build a multi-stop route URL
    const addresses = todayRoute.map((stop) => encodeURIComponent(stop.address)).join("/")
    window.open(`https://www.google.com/maps/dir/${addresses}`, "_blank")
  }

  const getPriorityColor = (priority: RouteStop["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getTypeIcon = (type: RouteStop["type"]) => {
    switch (type) {
      case "job":
        return <TreeDeciduous className="h-4 w-4 text-primary" />
      case "quote":
        return <MapPin className="h-4 w-4 text-accent" />
      case "follow-up":
        return <Clock className="h-4 w-4 text-chart-2" />
      case "damage-spotted":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Route Planner</h1>
          <p className="text-muted-foreground">Plan your daily routes and track damage spots</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="storm-mode"
              checked={stormChaseMode}
              onCheckedChange={setStormChaseMode}
            />
            <Label htmlFor="storm-mode" className="flex items-center gap-1.5 cursor-pointer">
              <Zap className={stormChaseMode ? "h-4 w-4 text-destructive" : "h-4 w-4"} />
              Storm Chase Mode
            </Label>
          </div>
          <Button onClick={startNavigation}>
            <Play className="mr-2 h-4 w-4" />
            Start Route
          </Button>
        </div>
      </div>

      {/* Storm Chase Alert */}
      {stormChaseMode && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Storm Chase Mode Active</h3>
                <p className="text-sm text-muted-foreground">
                  Actively scanning for storm damage. Spotted damages will be added to your route.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today&apos;s Route</TabsTrigger>
          <TabsTrigger value="spotted">
            Spotted Damage
            <Badge variant="destructive" className="ml-2">
              {spottedDamage.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Route List */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Route Stops ({todayRoute.length})
                </CardTitle>
                <CardDescription>Optimized route for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayRoute.map((stop, index) => (
                    <div
                      key={stop.id}
                      className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        {index < todayRoute.length - 1 && (
                          <div className="h-8 w-0.5 bg-border" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(stop.type)}
                            <span className="font-medium">{stop.address}</span>
                          </div>
                          <Badge variant={getPriorityColor(stop.priority)}>
                            {stop.priority}
                          </Badge>
                        </div>
                        {stop.time && (
                          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {stop.time}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-muted-foreground">{stop.notes}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 px-2 text-xs"
                          onClick={() => openInMaps(stop.address)}
                        >
                          <Navigation className="mr-1 h-3 w-3" />
                          Navigate
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Route Map</CardTitle>
                <CardDescription>Visual route overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-80 flex-col items-center justify-center rounded-lg bg-secondary text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Interactive map</p>
                  <p className="text-sm text-muted-foreground">
                    {todayRoute.length} stops optimized
                  </p>
                  <Button variant="outline" className="mt-4" onClick={startNavigation}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Google Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spotted" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Spotted Damage
                  </CardTitle>
                  <CardDescription>
                    Damage spotted while driving - potential leads
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Damage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {spottedDamage.map((spot) => (
                  <div
                    key={spot.id}
                    className="flex items-start justify-between gap-4 rounded-lg bg-secondary/50 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium">{spot.address}</p>
                        <p className="text-sm text-muted-foreground">{spot.notes}</p>
                        {spot.photos && (
                          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {spot.photos} photos attached
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Create Lead
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openInMaps(spot.address)}>
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Weekly Route Summary</CardTitle>
              <CardDescription>Your route plan for the week</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Weekly route planning feature coming soon. Use voice command: &quot;Hey Bear Hub, plan my week&quot;
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
