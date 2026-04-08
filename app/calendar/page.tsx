"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  MapPin, Clock, User, Truck, Navigation
} from 'lucide-react'

// Demo scheduled jobs
const scheduledJobs = [
  { id: 1, date: '2026-04-08', time: '8:00 AM', customer: 'Johnson Property', address: '123 Oak St, Austin', service: 'Tree Removal', crew: 'Team Alpha', duration: '4 hrs', status: 'confirmed' },
  { id: 2, date: '2026-04-08', time: '1:00 PM', customer: 'Smith Realty', address: '456 Pine Ave, Austin', service: 'Trimming', crew: 'Team Alpha', duration: '2 hrs', status: 'confirmed' },
  { id: 3, date: '2026-04-09', time: '9:00 AM', customer: 'Oak Hills HOA', address: '789 Maple Dr, Cedar Park', service: 'Stump Grinding', crew: 'Team Beta', duration: '3 hrs', status: 'pending' },
  { id: 4, date: '2026-04-09', time: '2:00 PM', customer: 'Green Valley', address: '321 Elm Blvd, Round Rock', service: 'Emergency', crew: 'Team Alpha', duration: '2 hrs', status: 'confirmed' },
  { id: 5, date: '2026-04-10', time: '8:00 AM', customer: 'Riverside Apts', address: '555 River Rd, Austin', service: 'Tree Removal', crew: 'Team Beta', duration: '6 hrs', status: 'confirmed' },
  { id: 6, date: '2026-04-11', time: '10:00 AM', customer: 'Maple Grove HOA', address: '888 Cedar Ln, Pflugerville', service: 'Trimming', crew: 'Team Alpha', duration: '3 hrs', status: 'pending' },
]

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026
  const [selectedDate, setSelectedDate] = useState('2026-04-08')
  const [viewMode, setViewMode] = useState<'calendar' | 'route'>('calendar')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getJobsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return scheduledJobs.filter(job => job.date === dateStr)
  }

  const selectedJobs = scheduledJobs.filter(job => job.date === selectedDate)

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarIcon className="size-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Calendar & Routes</h1>
                  <p className="text-sm text-muted-foreground">Schedule jobs and plan routes</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
                size="sm"
              >
                <CalendarIcon className="size-4 mr-2" />
                Calendar
              </Button>
              <Button 
                variant={viewMode === 'route' ? 'default' : 'outline'}
                onClick={() => setViewMode('route')}
                size="sm"
              >
                <Navigation className="size-4 mr-2" />
                Route View
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="col-span-2 bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{monthName} {year}</CardTitle>
                <CardDescription>Click a date to view scheduled jobs</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="h-24 bg-secondary/20 rounded-lg" />
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayJobs = getJobsForDate(day)
                  const isSelected = dateStr === selectedDate
                  const isToday = day === 8 && month === 3 && year === 2026

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-24 p-2 rounded-lg border transition-all text-left ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-secondary/20 hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                          {day}
                        </span>
                        {isToday && (
                          <Badge className="text-[10px] px-1 py-0 bg-primary text-primary-foreground">Today</Badge>
                        )}
                      </div>
                      {dayJobs.length > 0 && (
                        <div className="space-y-1">
                          {dayJobs.slice(0, 2).map(job => (
                            <div 
                              key={job.id} 
                              className={`text-[10px] px-1 py-0.5 rounded truncate ${
                                job.status === 'confirmed' 
                                  ? 'bg-primary/20 text-primary' 
                                  : 'bg-amber-500/20 text-amber-500'
                              }`}
                            >
                              {job.time} - {job.service}
                            </div>
                          ))}
                          {dayJobs.length > 2 && (
                            <div className="text-[10px] text-muted-foreground">
                              +{dayJobs.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar - Selected Day */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription>{selectedJobs.length} jobs scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No jobs scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {selectedJobs.map((job, i) => (
                      <div key={job.id} className="p-3 bg-secondary/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={job.status === 'confirmed' ? 'default' : 'outline'} 
                            className={job.status === 'confirmed' ? 'bg-primary' : 'border-amber-500 text-amber-500'}>
                            {job.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{job.duration}</span>
                        </div>
                        <p className="font-medium">{job.service}</p>
                        <p className="text-sm text-muted-foreground">{job.customer}</p>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {job.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {job.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="size-3" />
                            {job.crew}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Summary */}
            {selectedJobs.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="size-5 text-primary" />
                    Route Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Stops</span>
                      <span className="font-medium">{selectedJobs.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Drive Time</span>
                      <span className="font-medium">45 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Work Time</span>
                      <span className="font-medium">
                        {selectedJobs.reduce((sum, job) => sum + parseInt(job.duration), 0)} hrs
                      </span>
                    </div>
                    <Button className="w-full mt-3" size="sm">
                      <Navigation className="size-4 mr-2" />
                      Open in Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
