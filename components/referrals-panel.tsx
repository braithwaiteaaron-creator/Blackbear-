"use client"

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
  Loader2,
  CheckCircle,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useReferrers, useJobs } from "@/lib/supabase/hooks"
import { toast } from "sonner"

export function ReferralsPanel() {
  const { referrers, loading, createReferrer, deleteReferrer } = useReferrers()
  const { jobs } = useJobs()
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [deleteReferrerId, setDeleteReferrerId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    code: "",
    type: "new" as "new" | "loyal" | "referrer",
    discount: 10,
  })

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Copied ${code} to clipboard`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDeleteReferrer = async () => {
    if (!deleteReferrerId) return
    const { error } = await deleteReferrer(deleteReferrerId)
    if (error) {
      toast.error("Failed to delete code")
    } else {
      toast.success("Code deleted")
    }
    setDeleteReferrerId(null)
  }

  const getReferralStats = (name: string, code: string) => {
    const referredJobs = jobs.filter(j => 
      j.notes?.toLowerCase().includes(`referral: ${name.toLowerCase()}`) ||
      j.notes?.toLowerCase().includes(code.toLowerCase())
    )
    return {
      count: referredJobs.length,
      value: referredJobs.reduce((sum, j) => sum + Number(j.value || 0), 0)
    }
  }

  const handleSubmit = async () => {
    if (!formData.code) {
      toast.error("Please enter a code")
      return
    }

    if (formData.type === "referrer" && !formData.name) {
      toast.error("Please enter the person's name")
      return
    }

    if (referrers.find(r => r.referral_code.toLowerCase() === formData.code.toLowerCase())) {
      toast.error("This code already exists")
      return
    }

    setIsSubmitting(true)
    const { error } = await createReferrer({
      name: formData.type === "new" ? "New Customer" : formData.type === "loyal" ? "Repeat Customer" : formData.name,
      phone: formData.phone,
      referral_code: formData.code.toUpperCase(),
      total_referrals: 0,
      converted_referrals: 0,
      total_value: 0,
      commission_rate: formData.discount / 100,
      commission_earned: 0,
      status: "active",
    })
    setIsSubmitting(false)

    if (error) {
      toast.error("Failed to create code")
    } else {
      toast.success(`${formData.discount}% off code created: ${formData.code.toUpperCase()}`)
      setIsNewOpen(false)
      setFormData({ name: "", phone: "", code: "", type: "new", discount: 10 })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discount Codes</h1>
          <p className="text-muted-foreground">Manage referral and loyalty codes</p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
              <DialogDescription>
                Set up codes for different customer types
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Code Type</Label>
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as "new" | "loyal" | "referrer"
                    let newDiscount = 10
                    if (newType === "loyal") newDiscount = 15
                    setFormData({ ...formData, type: newType, discount: newDiscount })
                  }}
                >
                  <option value="new">New Customer (One-time)</option>
                  <option value="loyal">Repeat Customer (Loyalty)</option>
                  <option value="referrer">Person Promoting (Referrer)</option>
                </select>
              </div>

              {formData.type === "referrer" && (
                <>
                  <div className="grid gap-2">
                    <Label>Person&apos;s Name</Label>
                    <Input 
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone (optional)</Label>
                    <Input 
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label>Code</Label>
                <Input 
                  placeholder={formData.type === "new" ? "BLACKBEAR10" : formData.type === "loyal" ? "LOYAL15" : "JOHN10"}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="font-mono text-lg"
                />
              </div>

              <div className="grid gap-2">
                <Label>Discount %</Label>
                <Input 
                  type="number"
                  min="1"
                  max="50"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 10 })}
                />
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

      <div className="grid gap-4">
        {referrers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No discount codes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create codes for new customers, loyal repeat clients, and referral partners
              </p>
              <Button onClick={() => setIsNewOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          referrers.map((referrer) => {
            const stats = getReferralStats(referrer.name, referrer.referral_code)
            const discountPercent = Math.round(referrer.commission_rate * 100)
            const isNewCustomer = referrer.name === "New Customer"
            const isRepeatCustomer = referrer.name === "Repeat Customer"
            
            return (
              <Card key={referrer.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold text-white ${
                        isNewCustomer ? "bg-blue-500" : isRepeatCustomer ? "bg-purple-500" : "bg-primary"
                      }`}>
                        {isNewCustomer ? "NEW" : isRepeatCustomer ? "VIP" : referrer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{referrer.name}</h3>
                          <Badge variant="outline" className={`text-xs ${
                            isNewCustomer ? "bg-blue-500/20 text-blue-600" : isRepeatCustomer ? "bg-purple-500/20 text-purple-600" : ""
                          }`}>
                            {isNewCustomer ? "New Customers" : isRepeatCustomer ? "Loyalty" : "Referrer"}
                          </Badge>
                        </div>
                        {referrer.phone && !isNewCustomer && !isRepeatCustomer && (
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
                        <p className="text-lg font-bold">{discountPercent}%</p>
                        <p className="text-xs text-muted-foreground">Discount</p>
                      </div>
                      {!isNewCustomer && !isRepeatCustomer && (
                        <>
                          <div className="text-center">
                            <p className="text-lg font-bold">{stats.count}</p>
                            <p className="text-xs text-muted-foreground">Jobs</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-accent">${stats.value.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Value</p>
                          </div>
                        </>
                      )}
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDeleteReferrerId(referrer.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteReferrerId} onOpenChange={() => setDeleteReferrerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discount Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this discount code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReferrer} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
