"use client"

import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TreePine, Percent, Phone, CheckCircle, Scissors, Trees, Axe } from 'lucide-react'

// Referral partner database - add your buddy here
const referralPartners: Record<string, {
  name: string
  company: string
  discount: number
  phone?: string
  email?: string
}> = {
  'REALESTATE10': {
    name: 'Your Real Estate Buddy',
    company: 'Buddy Realty',
    discount: 10,
    phone: '(555) 123-4567',
    email: 'buddy@realty.com'
  }
}

export default function ReferralPage() {
  const params = useParams()
  const code = (params.code as string)?.toUpperCase() || ''
  const partner = referralPartners[code]
  
  const discount = partner?.discount || 10
  const partnerName = partner?.name || 'Our Partner'
  const companyName = partner?.company || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Blackbear Tree Care</h1>
              <p className="text-xs text-emerald-400">Professional Tree Services</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4 px-4 py-2 text-sm">
            Exclusive Partner Discount
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            You Have Been Referred!
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            {partnerName} {companyName && `from ${companyName}`} has given you an exclusive deal
          </p>
        </div>

        {/* Discount Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="text-center pb-2">
              <CardDescription className="text-emerald-100 text-lg">Your Exclusive Discount</CardDescription>
              <CardTitle className="text-7xl font-bold text-white flex items-center justify-center gap-2">
                <Percent className="w-12 h-12" />
                {discount}
                <span className="text-3xl">OFF</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
                <p className="text-emerald-100 text-sm mb-2">Use this code when booking:</p>
                <div className="bg-white/20 rounded-lg px-6 py-3">
                  <span className="text-3xl font-mono font-bold text-white tracking-wider">{code}</span>
                </div>
              </div>
              <p className="text-emerald-100 text-sm">
                Valid on all tree care services including removal, trimming, and stump grinding
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Axe className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Tree Removal</h3>
                <p className="text-slate-400 text-sm">Safe and efficient removal of any size tree</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scissors className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Tree Trimming</h3>
                <p className="text-slate-400 text-sm">Professional shaping and maintenance</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trees className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Stump Grinding</h3>
                <p className="text-slate-400 text-sm">Complete stump removal below grade</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Why Choose Blackbear?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Licensed and fully insured',
                  'Free estimates on all jobs',
                  'Same-day emergency service available',
                  'Clean up included with every job',
                  'Competitive pricing with quality work'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-slate-800/80 border-slate-700 max-w-md mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-slate-400 mb-6">
                Call us today to schedule your free estimate and mention code <span className="text-emerald-400 font-bold">{code}</span> to receive your {discount}% discount!
              </p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6">
                <Phone className="w-5 h-5 mr-2" />
                Call (555) BEAR-TREE
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12 py-6 text-center text-slate-500 text-sm">
        <p>Blackbear Tree Care - Professional Tree Services</p>
        <p className="mt-1">Referred by: {partnerName}</p>
      </footer>
    </div>
  )
}
