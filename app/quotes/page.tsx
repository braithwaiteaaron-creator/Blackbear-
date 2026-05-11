import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, FileText, DollarSign, CheckCircle, Clock, X, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Quotes - Bear Hub Pro',
  description: 'Manage your quotes and pending proposals',
}

export default async function QuotesPage() {
  const supabase = await createClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, customers(name, phone, email)')
    .order('created_at', { ascending: false })

  const pending = quotes?.filter(q => q.status === 'pending').length || 0
  const accepted = quotes?.filter(q => q.status === 'accepted').length || 0
  const rejected = quotes?.filter(q => q.status === 'rejected').length || 0

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-primary-foreground/70 hover:text-primary-foreground">
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-2xl font-bold">Quotes</h1>
          </div>
          <Link href="/quotes/new">
            <Button size="sm" className="gap-1">
              <Plus className="size-4" /> New Quote
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-amber-400">{pending}</p>
                </div>
                <Clock className="size-10 text-amber-400/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-3xl font-bold text-emerald-400">{accepted}</p>
                </div>
                <CheckCircle className="size-10 text-emerald-400/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-red-400">{rejected}</p>
                </div>
                <X className="size-10 text-red-400/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quotes List */}
        <div className="space-y-3">
          {!quotes || quotes.length === 0 ? (
            <Card className="bg-card border-border/50">
              <CardContent className="p-8 text-center">
                <FileText className="size-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No quotes yet</p>
              </CardContent>
            </Card>
          ) : (
            quotes.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`}>
                <Card className="bg-card border-border/50 hover:border-border transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{quote.service_type}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            quote.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            quote.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{quote.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {quote.customers?.name} • {new Date(quote.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${Number(quote.amount).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
