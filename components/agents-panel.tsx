"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  UserCircle,
  TrendingUp,
  DollarSign,
  TreeDeciduous,
  Plus,
  Star,
  Award,
  Wallet,
  ArrowUpRight,
} from "lucide-react"

interface Agent {
  id: number
  name: string
  role: "sales" | "climber" | "manager"
  avatar: string
  avatarImage?: string
  jobsCompleted: number
  monthlyRevenue: number
  commission: number
  rating: number
  status: "active" | "on-job" | "off-duty"
  investmentBalance?: number
  treesThisMonth: number
}

const investmentStats = {
  totalPool: 0,
  litecoinPrice: 0,
  monthlyDistribution: 0,
  participants: 0,
}

export function AgentsPanel() {
  const [agents, setAgents] = useState<Agent[]>([])
  // TODO: Replace with useAgents hook from @/lib/supabase/hooks

  const getRoleBadge = (role: Agent["role"]) => {
    switch (role) {
      case "manager":
        return <Badge className="bg-primary">Manager</Badge>
      case "sales":
        return <Badge variant="secondary">Sales</Badge>
      case "climber":
        return <Badge variant="outline">Climber</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "on-job":
        return "bg-primary"
      case "active":
        return "bg-accent"
      case "off-duty":
        return "bg-muted"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground">Track team performance and investment opportunities</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-xl font-bold">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Commissions</p>
                <p className="text-xl font-bold">
                  ${agents.reduce((sum, a) => sum + a.commission, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <TreeDeciduous className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trees This Month</p>
                <p className="text-xl font-bold">
                  {agents.reduce((sum, a) => sum + a.treesThisMonth, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-5/10">
                <Wallet className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investment Pool</p>
                <p className="text-xl font-bold">${investmentStats.totalPool.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="investment">Investment Program</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {agents.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-8 text-center">
                <UserCircle className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium text-muted-foreground">No agents yet</p>
                <p className="text-sm text-muted-foreground mt-1">Tap &quot;Add Agent&quot; to add your team members</p>
              </div>
            )}
            {agents.map((agent) => (
              <Card key={agent.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        {agent.avatarImage && (
                          <AvatarImage src={agent.avatarImage} alt={agent.name} className="object-cover" />
                        )}
                        <AvatarFallback className="bg-secondary text-lg">
                          {agent.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card ${getStatusColor(agent.status)}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(agent.role)}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-accent text-accent" />
                              {agent.rating}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={agent.status === "on-job" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {agent.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold">{agent.jobsCompleted}</p>
                          <p className="text-xs text-muted-foreground">Jobs</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-accent">
                            ${agent.commission.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Commission</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{agent.treesThisMonth}</p>
                          <p className="text-xs text-muted-foreground">Trees</p>
                        </div>
                      </div>
                      {agent.investmentBalance && (
                        <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/50 p-2 text-sm">
                          <span className="text-muted-foreground">Investment Balance</span>
                          <span className="font-semibold text-primary">
                            ${agent.investmentBalance.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="investment" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Agent Investment Program
                </CardTitle>
                <CardDescription>
                  Earn Litecoin on Base or Wealthsimple credit for every tree job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Pool Value</span>
                      <span className="text-2xl font-bold">
                        ${investmentStats.totalPool.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-xs text-muted-foreground">Litecoin Price</p>
                      <p className="text-lg font-bold">${investmentStats.litecoinPrice}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-xs text-muted-foreground">Monthly Distribution</p>
                      <p className="text-lg font-bold text-primary">
                        ${investmentStats.monthlyDistribution.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <h4 className="font-medium mb-2">How It Works</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                        Complete tree service jobs
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                        Earn percentage per contract
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span>
                        Choose Litecoin on Base or Wealthsimple
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">4</span>
                        Watch your investment grow
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Participating Agents</CardTitle>
                <CardDescription>
                  {investmentStats.participants} agents enrolled in investment program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents
                    .filter((a) => a.investmentBalance)
                    .map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10">
                              {agent.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {agent.treesThisMonth} trees this month
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            ${agent.investmentBalance?.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <ArrowUpRight className="h-3 w-3 text-primary" />
                            +12.5%
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                Monthly Leaderboard
              </CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...agents]
                  .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                  .map((agent, index) => (
                    <div
                      key={agent.id}
                      className={`flex items-center justify-between rounded-lg p-3 ${
                        index === 0
                          ? "bg-accent/10 border border-accent"
                          : "bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                            index === 0
                              ? "bg-accent text-accent-foreground"
                              : index === 1
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <Avatar>
                          <AvatarFallback>{agent.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.jobsCompleted} jobs completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">
                          ${agent.monthlyRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">revenue</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
