import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Cloud, Sun, CloudRain, Wind, AlertTriangle, CheckCircle, Thermometer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Weather Forecast - Bear Hub Pro',
  description: 'Check weather conditions for your jobs',
}

// Server-side weather fetch
async function getWeatherForAddress(address: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/weather?address=${encodeURIComponent(address)}`,
      { next: { revalidate: 1800 } }
    )
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

export default async function WeatherPage() {
  const supabase = await createClient()

  // Get upcoming scheduled jobs with addresses
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .in('status', ['scheduled', 'in_progress'])
    .not('address', 'is', null)
    .order('scheduled_date', { ascending: true })
    .limit(10)

  // Get unique addresses
  const uniqueAddresses = [...new Set((jobs || []).map((j: any) => j.address).filter(Boolean))]

  // Fetch weather for each unique address (limit to first 3 to avoid rate limits)
  const weatherData: Record<string, any> = {}
  for (const address of uniqueAddresses.slice(0, 3)) {
    const weather = await getWeatherForAddress(address as string)
    if (weather) {
      weatherData[address as string] = weather
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Cloud className="size-5" />
            <h1 className="text-xl font-bold">Weather Forecast</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sun className="size-8 text-amber-400 shrink-0" />
              <div>
                <h2 className="font-semibold text-lg mb-1">Weather-Based Job Planning</h2>
                <p className="text-sm text-muted-foreground">
                  Check weather conditions at your job sites before scheduling. Bad weather alerts help you reschedule and keep your crew safe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather by Job Location */}
        {Object.keys(weatherData).length === 0 ? (
          <Card className="bg-card border-border/50 text-center p-8">
            <Cloud className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Job Locations Found</h3>
            <p className="text-muted-foreground mb-6">
              Schedule some jobs with addresses to see weather forecasts for your work locations.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Go to Dashboard
            </Link>
          </Card>
        ) : (
          Object.entries(weatherData).map(([address, weather]: [string, any]) => (
            <Card key={address} className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-base">{address}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Conditions */}
                <div className="flex items-center gap-6 p-4 rounded-xl bg-background">
                  <div className="text-4xl">{weather.current.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">{weather.current.temperature}°</span>
                      <span className="text-muted-foreground">{weather.current.temperatureUnit}</span>
                    </div>
                    <p className="text-muted-foreground">{weather.current.description}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Wind className="size-3" />
                      {weather.current.windSpeed} {weather.current.windUnit}
                    </div>
                  </div>
                </div>

                {/* 7-Day Forecast */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">7-Day Work Conditions Forecast</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {weather.forecast.map((day: any) => (
                      <div
                        key={day.date}
                        className={`p-3 rounded-xl text-center ${
                          day.workSafe
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">{day.dayName}</div>
                        <div className="text-xl mb-1">{day.icon}</div>
                        <div className="text-xs">
                          <span className="font-semibold">{day.tempHigh}°</span>
                          <span className="text-muted-foreground">/{day.tempLow}°</span>
                        </div>
                        <div className="mt-2">
                          {day.workSafe ? (
                            <CheckCircle className="size-4 text-emerald-400 mx-auto" />
                          ) : (
                            <AlertTriangle className="size-4 text-red-400 mx-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Conditions Details */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Daily Work Assessment</h4>
                  <div className="space-y-2">
                    {weather.forecast.slice(0, 5).map((day: any) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between p-3 rounded-xl bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{day.icon}</span>
                          <div>
                            <div className="font-medium">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-sm text-muted-foreground">{day.reason}</div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={day.workSafe ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}
                        >
                          {day.workSafe ? 'Safe' : 'Reschedule'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jobs at this location */}
                {jobs && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Jobs at this Location</h4>
                    <div className="space-y-2">
                      {jobs
                        .filter((j: any) => j.address === address)
                        .map((job: any) => {
                          const jobDate = job.scheduled_date
                          const forecast = weather.forecast.find((f: any) => f.date === jobDate)
                          
                          return (
                            <Link key={job.id} href={`/jobs/${job.id}`}>
                              <div className="flex items-center justify-between p-3 rounded-xl bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                                <div>
                                  <div className="font-medium">{job.service_type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {job.scheduled_date 
                                      ? new Date(job.scheduled_date).toLocaleDateString()
                                      : 'Not scheduled'}
                                  </div>
                                </div>
                                {forecast && (
                                  <Badge
                                    variant="outline"
                                    className={forecast.workSafe ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}
                                  >
                                    {forecast.icon} {forecast.workSafe ? 'Good' : 'Bad Weather'}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              Weather Safety Guidelines for Tree Work
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>• <strong>Wind:</strong> Avoid climbing when winds exceed 25 km/h (15 mph)</p>
            <p>• <strong>Rain:</strong> Wet conditions make climbing dangerous - reschedule if possible</p>
            <p>• <strong>Lightning:</strong> Stop all work immediately when thunderstorms approach</p>
            <p>• <strong>Fog:</strong> Reduced visibility can hide hazards - proceed with caution</p>
            <p>• <strong>Temperature:</strong> Extreme heat or cold requires additional safety measures</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
