"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  QrCode,
  Send,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

interface Transaction {
  id: number
  customer: string
  address: string
  amount: number
  type: "e-transfer" | "qr-payment" | "cash" | "invoice"
  status: "completed" | "pending" | "overdue"
  date: string
  jobType: string
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    customer: "Johnson Family",
    address: "456 Maple Avenue",
    amount: 1200,
    type: "e-transfer",
    status: "completed",
    date: "2026-03-21",
    jobType: "Tree Removal",
  },
  {
    id: 2,
    customer: "Smith Residence",
    address: "789 Cedar Lane",
    amount: 450,
    type: "qr-payment",
    status: "pending",
    date: "2026-03-20",
    jobType: "Pruning",
  },
  {
    id: 3,
    customer: "Municipal Parks",
    address: "123 Oak Street",
    amount: 2800,
    type: "invoice",
    status: "pending",
    date: "2026-03-19",
    jobType: "Storm Damage",
  },
  {
    id: 4,
    customer: "Thompson Estate",
    address: "321 Pine Road",
    amount: 350,
    type: "e-transfer",
    status: "completed",
    date: "2026-03-18",
    jobType: "Stump Grinding",
  },
  {
    id: 5,
    customer: "Anderson Corp",
    address: "555 Birch Drive",
    amount: 1800,
    type: "e-transfer",
    status: "completed",
    date: "2026-03-15",
    jobType: "Tree Installation",
  },
  {
    id: 6,
    customer: "Green Acres HOA",
    address: "Green Acres Subdivision",
    amount: 3500,
    type: "invoice",
    status: "overdue",
    date: "2026-03-01",
    jobType: "Community Maintenance",
  },
]

const financialStats = {
  mtdRevenue: 24850,
  mtdExpenses: 8200,
  pendingPayments: 6750,
  overduePayments: 3500,
  monthlyGrowth: 18,
}

export function FinancialsPanel() {
  const [transactions] = useState<Transaction[]>(mockTransactions)

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "pending":
        return <Clock className="h-4 w-4 text-accent" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "e-transfer":
        return <Send className="h-4 w-4" />
      case "qr-payment":
        return <QrCode className="h-4 w-4" />
      case "invoice":
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financials</h1>
          <p className="text-muted-foreground">Track revenue, payments, and expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <QrCode className="mr-2 h-4 w-4" />
            Generate QR
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue MTD</p>
                <p className="text-2xl font-bold">${financialStats.mtdRevenue.toLocaleString()}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                  <ArrowUpRight className="h-3 w-3" />
                  +{financialStats.monthlyGrowth}% vs last month
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expenses MTD</p>
                <p className="text-2xl font-bold">${financialStats.mtdExpenses.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">Fuel, equipment, wages</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <ArrowDownRight className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-accent">
                  ${financialStats.pendingPayments.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">3 invoices pending</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">
                  ${financialStats.overduePayments.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">1 invoice overdue</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Accept payments via multiple methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <Send className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">E-Transfer</p>
                <p className="text-sm text-muted-foreground">blackbeartrees27@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <QrCode className="h-8 w-8 text-accent" />
              <div>
                <p className="font-medium">QR Code Payment</p>
                <p className="text-sm text-muted-foreground">Generate per job</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <CreditCard className="h-8 w-8 text-chart-2" />
              <div>
                <p className="font-medium">Invoice</p>
                <p className="text-sm text-muted-foreground">Net 30 for commercial</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {transactions.filter((t) => t.status === "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            <Badge variant="destructive" className="ml-2">
              {transactions.filter((t) => t.status === "overdue").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{tx.customer}</p>
                          {getStatusIcon(tx.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{tx.jobType}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          tx.status === "completed"
                            ? "text-primary"
                            : tx.status === "overdue"
                            ? "text-destructive"
                            : "text-accent"
                        }`}
                      >
                        ${tx.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant={
                          tx.status === "completed"
                            ? "secondary"
                            : tx.status === "overdue"
                            ? "destructive"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              {transactions
                .filter((t) => t.status === "pending")
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 mb-2"
                  >
                    <div>
                      <p className="font-medium">{tx.customer}</p>
                      <p className="text-sm text-muted-foreground">{tx.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-accent">
                        ${tx.amount.toLocaleString()}
                      </span>
                      <Button size="sm">Send Reminder</Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-4">
          <Card className="bg-card border-destructive">
            <CardContent className="p-4">
              {transactions
                .filter((t) => t.status === "overdue")
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-destructive/10 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium">{tx.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {tx.date} - {Math.floor((Date.now() - new Date(tx.date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-destructive">
                        ${tx.amount.toLocaleString()}
                      </span>
                      <Button size="sm" variant="destructive">
                        Urgent Follow-up
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
