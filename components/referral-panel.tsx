'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Copy, QrCode, Link2, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { QRCodeCard } from '@/components/qr-code-card'

interface Referrer {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  referralsCount: number
  conversionsCount: number
  joinDate: string
  notes?: string
}

const mockReferrers: Referrer[] = [
  {
    id: 'clayton-001',
    name: 'Clayton Curtiss',
    email: 'clayton@email.com',
    phone: '647-555-0123',
    status: 'active',
    referralsCount: 8,
    conversionsCount: 5,
    joinDate: '2026-01-15',
    notes: 'Top referrer - excellent results',
  },
  {
    id: 'sarah-001',
    name: 'Sarah Williams',
    email: 'sarah@email.com',
    phone: '647-555-0124',
    status: 'active',
    referralsCount: 3,
    conversionsCount: 2,
    joinDate: '2026-02-20',
  },
  {
    id: 'mike-001',
    name: 'Mike Thompson',
    email: 'mike@email.com',
    phone: '647-555-0125',
    status: 'inactive',
    referralsCount: 1,
    conversionsCount: 0,
    joinDate: '2025-12-10',
  },
]

export function ReferralPanel() {
  const [referrers, setReferrers] = useState<Referrer[]>(mockReferrers)
  const [newReferrerName, setNewReferrerName] = useState('')
  const [showQRCode, setShowQRCode] = useState<string | null>(null)

  const getReferralUrl = (id: string, name: string) => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/referral/${id}?referrer=${encodeURIComponent(name)}`
  }

  const copyReferralLink = (id: string, name: string) => {
    navigator.clipboard.writeText(getReferralUrl(id, name))
    toast.success('Referral link copied!')
  }

  const addReferrer = () => {
    if (!newReferrerName.trim()) return
    const newId = `ref-${Date.now()}`
    const newReferrer: Referrer = {
      id: newId,
      name: newReferrerName,
      email: '',
      phone: '',
      status: 'active',
      referralsCount: 0,
      conversionsCount: 0,
      joinDate: new Date().toISOString().split('T')[0],
    }
    setReferrers([...referrers, newReferrer])
    setNewReferrerName('')
    toast.success(`${newReferrerName} added as referral partner!`)
  }

  const totalReferrals = referrers.reduce((sum, r) => sum + r.referralsCount, 0)
  const totalConversions = referrers.reduce((sum, r) => sum + r.conversionsCount, 0)
  const conversionRate = totalReferrals > 0 ? ((totalConversions / totalReferrals) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
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

      {/* Add New Referrer */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Add Referral Partner</CardTitle>
          <CardDescription>Invite a new partner to refer Black Bear Tree Care</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Partner name..."
            value={newReferrerName}
            onChange={(e) => setNewReferrerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addReferrer()}
          />
          <Button onClick={addReferrer} className="gap-2">
            <Users className="h-4 w-4" />
            Add Partner
          </Button>
        </CardContent>
      </Card>

      {/* Referrers List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Referral Partners</CardTitle>
          <CardDescription>Manage your referral network and track performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                  <p className="text-sm text-muted-foreground">{referrer.email}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Referrals: <span className="font-medium text-foreground">{referrer.referralsCount}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Conversions: <span className="font-medium text-foreground">{referrer.conversionsCount}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyReferralLink(referrer.id, referrer.name)}
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
                        value={getReferralUrl(referrer.id, referrer.name)}
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
    </div>
  )
}
