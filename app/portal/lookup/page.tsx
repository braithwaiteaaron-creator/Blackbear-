import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TreeDeciduous, ArrowLeft, FileText, CheckCircle, Clock, AlertCircle, Star, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Your Jobs - Bear Hub Pro',
  description: 'View your job history and status',
}

async function submitReview(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const jobId = formData.get('job_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const comment = formData.get('comment') as string
  
  // Update job with review
  await supabase
    .from('jobs')
    .update({ 
      review_rating: rating,
      review_comment: comment,
      review_date: new Date().toISOString()
    })
    .eq('id', jobId)
  
  redirect(`/portal/lookup?reviewed=true&email=${formData.get('email')}`)
}

export default async function CustomerLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; phone?: string; reviewed?: string }>
}) {
  const params = await searchParams
  const { email, phone, reviewed } = params
  const supabase = await createClient()

  // Find customer by email or phone
  let customer = null
  if (email) {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .ilike('email', email)
      .single()
    customer = data
  } else if (phone) {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .ilike('phone', `%${phone.replace(/\D/g, '')}%`)
      .single()
    customer = data
  }

  // Get jobs for this customer
  let jobs: any[] = []
  if (customer) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
    jobs = data || []
  }

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    quote: { label: 'Quote Pending', icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
    scheduled: { label: 'Scheduled', icon: Clock, color: 'text-blue-400 bg-blue-500/10' },
    in_progress: { label: 'In Progress', icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="hover:opacity-80">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex items-center gap-3">
              <TreeDeciduous className="size-6" />
              <h1 className="text-xl font-bold">Customer Portal</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {reviewed && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Thank you for your review! We appreciate your feedback.
          </div>
        )}

        {!customer ? (
          <Card className="bg-card border-border/50 text-center p-8">
            <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Account Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find an account with that email or phone number.
            </p>
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-colors"
            >
              <ArrowLeft className="size-4" />
              Try Again
            </Link>
          </Card>
        ) : (
          <>
            {/* Customer Info */}
            <Card className="bg-card border-border/50 mb-6">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">Welcome, {customer.name}!</h2>
                <p className="text-muted-foreground">
                  {customer.email} {customer.phone && `• ${customer.phone}`}
                </p>
                {customer.address && (
                  <p className="text-sm text-muted-foreground mt-1">{customer.address}</p>
                )}
              </CardContent>
            </Card>

            {/* Jobs List */}
            <h3 className="text-lg font-semibold mb-4">Your Jobs ({jobs.length})</h3>
            
            {jobs.length === 0 ? (
              <Card className="bg-card border-border/50 text-center p-8">
                <p className="text-muted-foreground">No jobs found for your account.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const status = statusConfig[job.status] || statusConfig.quote
                  const StatusIcon = status.icon
                  const amount = Number(job.actual_amount || job.estimated_amount || 0)
                  const canReview = job.status === 'completed' && !job.review_rating

                  return (
                    <Card key={job.id} className="bg-card border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{job.service_type}</h4>
                              <Badge variant="outline" className={status.color}>
                                <StatusIcon className="size-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{job.address}</p>
                            {job.scheduled_date && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
                              </p>
                            )}
                            {job.description && (
                              <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${amount.toLocaleString()}</p>
                            {job.paid && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mt-2">
                                Paid
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Review Section */}
                        {job.review_rating ? (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Your Review:</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`size-4 ${star <= job.review_rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {job.review_comment && (
                              <p className="text-sm text-muted-foreground">{job.review_comment}</p>
                            )}
                          </div>
                        ) : canReview ? (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <form action={submitReview} className="space-y-4">
                              <input type="hidden" name="job_id" value={job.id} />
                              <input type="hidden" name="email" value={email || ''} />
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">Rate Your Experience</label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <label key={star} className="cursor-pointer">
                                      <input
                                        type="radio"
                                        name="rating"
                                        value={star}
                                        className="sr-only peer"
                                        required
                                      />
                                      <Star className="size-8 text-muted-foreground peer-checked:text-amber-400 peer-checked:fill-amber-400 hover:text-amber-400 transition-colors" />
                                    </label>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                                <textarea
                                  name="comment"
                                  rows={3}
                                  placeholder="Tell us about your experience..."
                                  className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                              </div>
                              
                              <button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-xl transition-colors"
                              >
                                Submit Review
                              </button>
                            </form>
                          </div>
                        ) : null}

                        {/* Invoice Link */}
                        {job.status === 'completed' && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <Link
                              href={`/api/invoices/${job.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                            >
                              <FileText className="size-4" />
                              View Invoice
                              <ChevronRight className="size-4" />
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
