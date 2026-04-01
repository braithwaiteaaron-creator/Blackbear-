// OpenWeather API client for real-time weather data
// Get your free API key from openweathermap.org

export interface WeatherAlert {
  event: string
  start: number
  end: number
  severity: 'low' | 'moderate' | 'high'
  description?: string
}

export interface WeatherData {
  temp: number
  windSpeed: number
  windGust?: number
  description: string
  alerts: WeatherAlert[]
}

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const TORONTO_LAT = 43.6629
const TORONTO_LON = -79.3957

export async function getWeatherAlerts(): Promise<WeatherAlert[]> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured')
    // Return demo alerts when no API key
    return [
      {
        event: 'High Wind Warning',
        start: Date.now(),
        end: Date.now() + 3600000,
        severity: 'moderate',
        description: 'Wind gusts 45-55 km/h expected. Good day for storm chasing!',
      }
    ]
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${TORONTO_LAT}&lon=${TORONTO_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )

    if (!response.ok) throw new Error('Weather API request failed')

    const data = await response.json()
    const alerts: WeatherAlert[] = []

    // Check for severe weather conditions
    const windSpeed = data.wind?.speed || 0
    const windGust = data.wind?.gust || 0

    // Severe wind warning (>40 km/h = 11 m/s)
    if (windSpeed > 11 || windGust > 15) {
      alerts.push({
        event: 'High Wind Warning',
        start: Date.now(),
        end: Date.now() + 3600000,
        severity: windGust > 20 ? 'high' : 'moderate',
        description: `Wind speed: ${(windSpeed * 3.6).toFixed(1)} km/h, Gusts: ${(windGust * 3.6).toFixed(1)} km/h`,
      })
    }

    // Check for thunderstorms (high chance of lightning)
    const weather = data.weather?.[0]?.main || ''
    if (weather.includes('Thunderstorm') || weather.includes('Lightning')) {
      alerts.push({
        event: 'Thunderstorm/Lightning Warning',
        start: Date.now(),
        end: Date.now() + 1800000,
        severity: 'high',
        description: 'Thunderstorms with lightning detected in your area',
      })
    }

    return alerts
  } catch (error) {
    console.error('Error fetching weather alerts:', error)
    return []
  }
}

export async function getCurrentWeather(): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) return null

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${TORONTO_LAT}&lon=${TORONTO_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )

    if (!response.ok) return null

    const data = await response.json()
    const alerts = await getWeatherAlerts()

    return {
      temp: Math.round(data.main?.temp || 0),
      windSpeed: data.wind?.speed || 0,
      windGust: data.wind?.gust,
      description: data.weather?.[0]?.main || 'Unknown',
      alerts,
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}
