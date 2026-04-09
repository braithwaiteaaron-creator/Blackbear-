'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, X } from 'lucide-react'

interface JobTimeTrackerProps {
  jobId: string
  initialStartTime?: string
  initialEndTime?: string
  onTimeUpdate: (startTime: string | null, endTime: string | null) => void
}

export function JobTimeTracker({
  jobId,
  initialStartTime,
  initialEndTime,
  onTimeUpdate,
}: JobTimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(
    initialStartTime ? new Date(initialStartTime) : null
  )
  const [endTime, setEndTime] = useState<Date | null>(
    initialEndTime ? new Date(initialEndTime) : null
  )
  const [displayTime, setDisplayTime] = useState('00:00:00')

  // Update display time every second
  useEffect(() => {
    if (!isRunning || !startTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = now.getTime() - startTime.getTime()
      const hours = Math.floor(elapsed / 3600000)
      const minutes = Math.floor((elapsed % 3600000) / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)

      setDisplayTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime])

  // Calculate and display elapsed time if both times are set
  useEffect(() => {
    if (startTime && endTime) {
      const elapsed = endTime.getTime() - startTime.getTime()
      const hours = Math.floor(elapsed / 3600000)
      const minutes = Math.floor((elapsed % 3600000) / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)

      setDisplayTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
      setIsRunning(false)
    }
  }, [startTime, endTime])

  const handleStart = () => {
    const now = new Date()
    setStartTime(now)
    setIsRunning(true)
    onTimeUpdate(now.toISOString(), null)
  }

  const handleStop = () => {
    const now = new Date()
    setEndTime(now)
    setIsRunning(false)
    if (startTime) {
      onTimeUpdate(startTime.toISOString(), now.toISOString())
    }
  }

  const handleReset = () => {
    setStartTime(null)
    setEndTime(null)
    setIsRunning(false)
    setDisplayTime('00:00:00')
    onTimeUpdate(null, null)
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary border border-border">
      <div className="text-center">
        <div className="text-3xl font-bold font-mono text-primary">{displayTime}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {startTime && !endTime && 'Timer running...'}
          {startTime && endTime && 'Timer stopped'}
          {!startTime && 'Ready to start'}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        {!startTime ? (
          <Button
            onClick={handleStart}
            size="sm"
            className="gap-2"
            variant="default"
          >
            <Play className="w-4 h-4" />
            Start
          </Button>
        ) : isRunning ? (
          <Button
            onClick={handleStop}
            size="sm"
            className="gap-2"
            variant="default"
          >
            <Pause className="w-4 h-4" />
            Stop
          </Button>
        ) : (
          <>
            <Button
              onClick={handleStart}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Resume
            </Button>
            <Button
              onClick={handleReset}
              size="sm"
              variant="ghost"
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Reset
            </Button>
          </>
        )}
      </div>

      {startTime && (
        <div className="text-xs text-muted-foreground space-y-1">
          {startTime && (
            <div>Started: {startTime.toLocaleTimeString()}</div>
          )}
          {endTime && (
            <div>Ended: {endTime.toLocaleTimeString()}</div>
          )}
        </div>
      )}
    </div>
  )
}
