import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TreeDeciduous, Search, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Customer Portal - Bear Hub Pro',
  description: 'View your job status and invoices',
}

async function lookupCustomer(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  
  if (email) {
    redirect(`/portal/lookup?email=${encodeURIComponent(email)}`)
  } else if (phone) {
    redirect(`/portal/lookup?phone=${encodeURIComponent(phone)}`)
  }
}

export default async function CustomerPortalPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="size-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <TreeDeciduous className="size-7" />
            </div>
            <h1 className="text-3xl font-bold">Bear Hub Pro</h1>
          </div>
          <p className="text-lg text-primary-foreground/80">Customer Portal</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">View Your Jobs & Invoices</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter your email or phone number to look up your account
            </p>
          </CardHeader>
          <CardContent>
            <form action={lookupCustomer} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="text-center text-muted-foreground">- or -</div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="(555) 123-4567"
                    className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors"
              >
                <Search className="size-5" />
                Look Up My Account
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-card border-border/50 text-center">
            <CardContent className="p-6">
              <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="size-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Track Job Status</h3>
              <p className="text-sm text-muted-foreground">See real-time updates on your scheduled jobs</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 text-center">
            <CardContent className="p-6">
              <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="size-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2">View Invoices</h3>
              <p className="text-sm text-muted-foreground">Access and download your invoices anytime</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 text-center">
            <CardContent className="p-6">
              <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="size-6 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">Leave Reviews</h3>
              <p className="text-sm text-muted-foreground">Share your experience and help us improve</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30 mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-muted-foreground">
              Contact us at <span className="text-primary font-medium">support@bearhubpro.com</span> or call <span className="text-primary font-medium">(555) 123-4567</span>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
