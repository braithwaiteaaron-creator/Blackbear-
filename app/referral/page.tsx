'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Phone, MessageCircle, Users, Star, Shield, MapPin, ArrowRight, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ReferralPageProps {
  referrerName?: string
  referrerId?: string
}

export default function ReferralPage({ referrerName = 'Clayton Curtiss', referrerId = 'clayton-001' }: ReferralPageProps) {
  const [copyMessage, setCopyMessage] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/referral/${referrerId}`)
    setCopyMessage(true)
    setTimeout(() => setCopyMessage(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-seal.png"
              alt="Black Bear Tree Care"
              width={40}
              height={40}
              className="rounded-full"
              style={{ width: 40, height: 40 }}
            />
            <span className="font-bold text-foreground">Black Bear</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Licensed & Insured
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4 gap-2">
                  <Users className="h-3 w-3" />
                  Referral Partner
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4">
                  You were referred by{' '}
                  <span className="text-primary">{referrerName}</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Experience premium tree care from the specialists who climb where others can&apos;t. We go above and beyond for every property.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="gap-2 rounded-full" asChild>
                  <a href="tel:647-764-9017">
                    <Phone className="h-5 w-5" />
                    Call Now
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 rounded-full" asChild>
                  <a href="sms:647-764-9017">
                    <MessageCircle className="h-5 w-5" />
                    Text Us
                  </a>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <div>
                    <p className="font-semibold text-foreground">5.0 Stars</p>
                    <p className="text-sm text-muted-foreground">On Yelp</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Serving GTA</p>
                    <p className="text-sm text-muted-foreground">Since 2021</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-[500px] hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/images/owner-climbing.jpg"
                  alt="Black Bear Tree Care Specialist"
                  width={400}
                  height={500}
                  className="rounded-2xl object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
          What We Specialize In
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Expert Climbing', desc: 'Inaccessible trees that others refuse. We climb where others can\'t.' },
            { title: 'Tree Removal', desc: 'Safe, professional removal with full cleanup and stump grinding.' },
            { title: 'Storm Damage', desc: '24/7 emergency response for storm-damaged trees on your property.' },
          ].map((service, i) => (
            <Card key={i} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Property Health Tags */}
      <section className="bg-secondary/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Property Assessment Process
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border-primary/30">
              <CardContent className="p-6 space-y-4">
                <Badge className="w-fit bg-chart-2">Excellent</Badge>
                <p className="font-semibold text-foreground">Healthy Trees</p>
                <p className="text-sm text-muted-foreground">Well-maintained, minimal risk. Routine maintenance recommended.</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-accent/30">
              <CardContent className="p-6 space-y-4">
                <Badge className="w-fit bg-accent">Monitor</Badge>
                <p className="font-semibold text-foreground">Attention Needed</p>
                <p className="text-sm text-muted-foreground">Some signs of stress or damage. Professional assessment recommended.</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-destructive/30">
              <CardContent className="p-6 space-y-4">
                <Badge className="w-fit bg-destructive">Critical</Badge>
                <p className="font-semibold text-foreground">Immediate Action</p>
                <p className="text-sm text-muted-foreground">Safety risk present. Urgent removal or repair needed.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Referrer Info */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Referred by {referrerName}
                </h3>
                <p className="text-muted-foreground">
                  Your referral partner trusts Black Bear Tree Care for premium tree services. Get the same expert care and attention they received.
                </p>
              </div>
              <div className="hidden sm:block">
                <QrCode className="h-12 w-12 text-muted-foreground/30" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-border bg-secondary/50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready for Premium Tree Care?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Contact us today for a free assessment. Available 24/7 for emergencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gap-2 rounded-full" asChild>
              <a href="tel:647-764-9017">
                <Phone className="h-5 w-5" />
                647-764-9017
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 rounded-full" asChild>
              <a href="https://blackbeartreecare.com">
                Visit Website
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Black Bear Tree Care • Licensed & Insured • Ontario, Canada
            </p>
            <div className="flex items-center gap-4">
              <a href="tel:647-764-9017" className="text-sm text-primary hover:underline">
                24/7: 647-764-9017
              </a>
              <a href="https://www.yelp.ca/biz/black-bear-tree-care" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                5-Star Yelp
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
