'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WeatherData {
  current: {
    temp: number
    condition: string
    humidity: number
    wind: number
    icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'wind'
  }
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
    icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'wind'
    rainChance: number
  }>
  alerts?: Array<{
    type: string
    message: string
  }>
}

const weatherIcons = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  wind: Wind,
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('Austin, TX')

  useEffect(() => {
    // Simulate fetching weather data - in production, use a real weather API
    const fetchWeather = async () => {
      setLoading(true)
      // Simulated weather data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockWeather: WeatherData = {
        current: {
          temp: 78,
          condition: 'Partly Cloudy',
          humidity: 55,
          wind: 12,
          icon: 'cloud',
        },
        forecast: [
          { day: 'Today', high: 82, low: 68, condition: 'Partly Cloudy', icon: 'cloud', rainChance: 10 },
          { day: 'Tomorrow', high: 85, low: 70, condition: 'Sunny', icon: 'sun', rainChance: 0 },
          { day: 'Wed', high: 79, low: 65, condition: 'Rain', icon: 'rain', rainChance: 80 },
        ],
        alerts: [],
      }
      
      setWeather(mockWeather)
      setLoading(false)
    }
    
    fetchWeather()
  }, [location])

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="size-12 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) return null

  const CurrentIcon = weatherIcons[weather.current.icon]

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cloud className="size-4 text-blue-400" />
            Weather - {location}
          </span>
          <span className="text-xs text-muted-foreground font-normal">Updated now</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Alerts */}
        {weather.alerts && weather.alerts.length > 0 && (
          <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-200">{weather.alerts[0].message}</p>
          </div>
        )}

        {/* Current Conditions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <CurrentIcon className="size-8 text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold">{weather.current.temp}°F</p>
              <p className="text-sm text-muted-foreground">{weather.current.condition}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <Droplets className="size-3" />
              {weather.current.humidity}%
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <Wind className="size-3" />
              {weather.current.wind} mph
            </div>
          </div>
        </div>

        {/* 3-Day Forecast */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
          {weather.forecast.map((day) => {
            const DayIcon = weatherIcons[day.icon]
            const isRainy = day.rainChance >= 50
            return (
              <div 
                key={day.day} 
                className={`text-center p-2 rounded-lg ${isRainy ? 'bg-blue-500/10' : 'bg-secondary/30'}`}
              >
                <p className="text-xs font-medium mb-1">{day.day}</p>
                <DayIcon className={`size-5 mx-auto mb-1 ${isRainy ? 'text-blue-400' : 'text-muted-foreground'}`} />
                <p className="text-xs">
                  <span className="font-semibold">{day.high}°</span>
                  <span className="text-muted-foreground ml-1">{day.low}°</span>
                </p>
                {day.rainChance > 0 && (
                  <p className="text-[10px] text-blue-400 flex items-center justify-center gap-0.5 mt-1">
                    <Droplets className="size-2" />
                    {day.rainChance}%
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Work Recommendation */}
        <div className="mt-3 pt-3 border-t border-border/50">
          {weather.forecast[0].rainChance >= 50 ? (
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <CloudRain className="size-3" />
              Rain expected - consider rescheduling outdoor work
            </p>
          ) : weather.current.wind >= 20 ? (
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <Wind className="size-3" />
              High winds - use caution with elevated work
            </p>
          ) : (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <Sun className="size-3" />
              Good conditions for outdoor work
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
