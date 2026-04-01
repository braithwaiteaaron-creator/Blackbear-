'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, QrCode, Link2, Users, TrendingUp, ArrowRight, Plus, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { QRCodeCard } from '@/components/qr-code-card'
import { useReferrers } from '@/lib/supabase/hooks'

export function ReferralPanel() {
  const { referrers, loading, createReferrer } = useReferrers()
  const [isNewReferrerOpen, setIsNewReferrerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQRCode, setShowQRCode] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const getReferralUrl = (code: string, name: string) => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/referral/${code}?referrer=${encodeURIComponent(name)}`
  }

  const copyReferralLink = (code: string, name: string) => {
    navigator.clipboard.writeText(getReferralUrl(code, name))
    toast.success('Referral link copied!')
  }

  const generateReferralCode = (name: string) => {
    const prefix = name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 4)
    const suffix = Math.random().toString(36).substring(2, 6)
    return `${prefix}-${suffix}`
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name')
      return
    }

    setIsSubmitting(true)
    const { data, error } = await createReferrer({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      referral_code: generateReferralCode(formData.name),
      total_referrals: 0,
      converted_referrals: 0,
      total_value: 0,
      commission_rate: 0.10,
      commission_earned: 0,
      status: 'active',
    })
    setIsSubmitting(false)

    if (error) {
      toast.error('Failed to add referral partner')
    } else {
      toast.success(`${formData.name} added as referral partner!`)
      setIsNewReferrerOpen(false)
      setFormData({ name: '', email: '', phone: '' })
    }
  }

  const totalReferrals = referrers.reduce((sum, r) => sum + (r.total_referrals || 0), 0)
  const totalConversions = referrers.reduce((sum, r) => sum + (r.converted_referrals || 0), 0)
  const conversionRate = totalReferrals > 0 ? ((totalConversions / totalReferrals) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Winners Circle</h1>
          <p className="text-muted-foreground">Manage referral partners and track performance</p>
        </div>
        <Dialog open={isNewReferrerOpen} onOpenChange={setIsNewReferrerOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Referral Partner</DialogTitle>
              <DialogDescription>Add someone to your referral network.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Partner name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewReferrerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Partner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Partners</p>
                <p className="text-2xl font-bold text-foreground">
                  {referrers.filter(r => r.status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
              </div>
              <Link2 className="h-8 w-8 text-accent/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold text-foreground">{totalConversions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-2/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
              </div>
              <ArrowRight className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Referrers List */}
      {!loading && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Referral Partners</CardTitle>
            <CardDescription>Manage your referral network and track performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referrers.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/30 p-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-muted-foreground">No referral partners yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Tap &quot;Add Partner&quot; to start building your network</p>
                </div>
              )}
              {referrers.map((referrer) => (
                <div
                  key={referrer.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{referrer.name}</h4>
                      <Badge variant={referrer.status === 'active' ? 'default' : 'secondary'}>
                        {referrer.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {referrer.email && <p className="text-sm text-muted-foreground">{referrer.email}</p>}
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Referrals: <span className="font-medium text-foreground">{referrer.total_referrals}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Conversions: <span className="font-medium text-foreground">{referrer.converted_referrals}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Earned: <span className="font-medium text-accent">${Number(referrer.commission_earned || 0).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyReferralLink(referrer.referral_code, referrer.name)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>

                    <Dialog open={showQRCode === referrer.id} onOpenChange={(open) => setShowQRCode(open ? referrer.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <QrCode className="h-4 w-4" />
                          QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{referrer.name} - Referral QR Code</DialogTitle>
                        </DialogHeader>
                        <QRCodeCard
                          value={getReferralUrl(referrer.referral_code, referrer.name)}
                          title={`${referrer.name} - Referral`}
                          description="Share this QR code to track referrals"
                          size={240}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
