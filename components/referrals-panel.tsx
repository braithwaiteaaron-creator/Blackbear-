"use client"

// Referral Code Tracking Panel
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Gift,
  Plus,
  Copy,
  Phone,
  DollarSign,
  Loader2,
  CheckCircle,
  Users,
} from "lucide-react"
import { useReferrers, useJobs } from "@/lib/supabase/hooks"
import { toast } from "sonner"

export function ReferralsPanel() {
  const { referrers, loading, createReferrer } = useReferrers()
  const { jobs } = useJobs()
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    code: "",
  })

  // Count jobs per referrer (jobs with referral info in notes)
  const getReferralStats = (referrerName: string, code: string) => {
    const referredJobs = jobs.filter(j => 
      j.notes?.toLowerCase().includes(`referral: ${referrerName.toLowerCase()}`) ||
      j.notes?.toLowerCase().includes(code.toLowerCase())
    )
    return {
      count: referredJobs.length,
      value: referredJobs.reduce((sum, j) => sum + Number(j.value || 0), 0)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Please enter name and code")
      return
    }

    // Check if code already exists
    if (referrers.find(r => r.referral_code.toLowerCase() === formData.code.toLowerCase())) {
      toast.error("This code already exists")
      return
    }

    setIsSubmitting(true)
    const { data, error } = await createReferrer({
      name: formData.name,
      phone: formData.phone,
      referral_code: formData.code.toUpperCase(),
      total_referrals: 0,
      converted_referrals: 0,
      total_value: 0,
      commission_rate: 0.10,
      commission_earned: 0,
      status: "active",
    })
    setIsSubmitting(false)

    if (error) {
      toast.error("Failed to create referral code")
    } else {
      toast.success(`Code ${formData.code.toUpperCase()} created for ${formData.name}!`)
      setIsNewOpen(false)
      setFormData({ name: "", phone: "", code: "" })
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Copied: ${code}`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Generate a simple code from name
  const generateCode = (name: string) => {
    const firstName = name.split(" ")[0].toUpperCase()
    const random = Math.floor(Math.random() * 100)
    return `${firstName}${random}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Referral Codes</h1>
          <p className="text-muted-foreground">Track who sends you business</p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Referral Code</DialogTitle>
              <DialogDescription>
                Give this code to someone who refers customers to you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Referrer Name *</Label>
                <Input 
                  id="name" 
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (!formData.code && e.target.value.length > 2) {
                      setFormData(prev => ({ ...prev, code: generateCode(e.target.value) }))
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input 
                  id="phone" 
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Referral Code *</Label>
                <Input 
                  id="code" 
                  placeholder="JOHN10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="font-mono text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  This is what customers will tell you when they book
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{referrers.length}</p>
                <p className="text-sm text-muted-foreground">Active Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Gift className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {referrers.reduce((sum, r) => {
                    const stats = getReferralStats(r.name, r.referral_code)
                    return sum + stats.count
                  }, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${referrers.reduce((sum, r) => {
                    const stats = getReferralStats(r.name, r.referral_code)
                    return sum + stats.value
                  }, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Referral Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Referrer List */}
      {!loading && (
        <div className="grid gap-4">
          {referrers.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-8 text-center">
              <Gift className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-muted-foreground">No referral codes yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create codes for people who send you business</p>
            </div>
          )}
          {referrers.map((referrer) => {
            const stats = getReferralStats(referrer.name, referrer.referral_code)
            return (
              <Card key={referrer.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-lg font-bold text-primary">
                          {referrer.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{referrer.name}</h3>
                        {referrer.phone && (
                          <a 
                            href={`tel:${referrer.phone}`}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                          >
                            <Phone className="h-3 w-3" />
                            {referrer.phone}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{stats.count}</p>
                        <p className="text-xs text-muted-foreground">Jobs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-accent">${stats.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Value</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyCode(referrer.referral_code)}
                        className="font-mono"
                      >
                        {copiedCode === referrer.referral_code ? (
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        {referrer.referral_code}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
