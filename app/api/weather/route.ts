import { NextRequest, NextResponse } from 'next/server'

// Free weather API using Open-Meteo (no API key required)
async function getWeather(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto&forecast_days=7`,
      { next: { revalidate: 1800 } } // Cache for 30 minutes
    )
    
    if (!response.ok) {
      throw new Error('Weather API error')
    }
    
    return await response.json()
  } catch (error) {
    console.error('[Weather] API error:', error)
    return null
  }
}

// Geocode address to coordinates using Nominatim (free, no API key)
async function geocodeAddress(address: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { 
        headers: { 'User-Agent': 'BearHubPro/1.0' },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    if (data.length === 0) return null
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display: data[0].display_name,
    }
  } catch {
    return null
  }
}

// Weather code descriptions
const weatherCodes: Record<number, { description: string; icon: string; severity: 'good' | 'caution' | 'bad' }> = {
  0: { description: 'Clear sky', icon: '☀️', severity: 'good' },
  1: { description: 'Mainly clear', icon: '🌤️', severity: 'good' },
  2: { description: 'Partly cloudy', icon: '⛅', severity: 'good' },
  3: { description: 'Overcast', icon: '☁️', severity: 'good' },
  45: { description: 'Fog', icon: '🌫️', severity: 'caution' },
  48: { description: 'Depositing rime fog', icon: '🌫️', severity: 'caution' },
  51: { description: 'Light drizzle', icon: '🌧️', severity: 'caution' },
  53: { description: 'Moderate drizzle', icon: '🌧️', severity: 'caution' },
  55: { description: 'Dense drizzle', icon: '🌧️', severity: 'bad' },
  56: { description: 'Freezing drizzle', icon: '🌨️', severity: 'bad' },
  57: { description: 'Dense freezing drizzle', icon: '🌨️', severity: 'bad' },
  61: { description: 'Slight rain', icon: '🌧️', severity: 'caution' },
  63: { description: 'Moderate rain', icon: '🌧️', severity: 'bad' },
  65: { description: 'Heavy rain', icon: '🌧️', severity: 'bad' },
  66: { description: 'Freezing rain', icon: '🌨️', severity: 'bad' },
  67: { description: 'Heavy freezing rain', icon: '🌨️', severity: 'bad' },
  71: { description: 'Slight snow', icon: '🌨️', severity: 'caution' },
  73: { description: 'Moderate snow', icon: '🌨️', severity: 'bad' },
  75: { description: 'Heavy snow', icon: '❄️', severity: 'bad' },
  77: { description: 'Snow grains', icon: '🌨️', severity: 'caution' },
  80: { description: 'Slight rain showers', icon: '🌦️', severity: 'caution' },
  81: { description: 'Moderate rain showers', icon: '🌧️', severity: 'bad' },
  82: { description: 'Violent rain showers', icon: '⛈️', severity: 'bad' },
  85: { description: 'Slight snow showers', icon: '🌨️', severity: 'caution' },
  86: { description: 'Heavy snow showers', icon: '❄️', severity: 'bad' },
  95: { description: 'Thunderstorm', icon: '⛈️', severity: 'bad' },
  96: { description: 'Thunderstorm with hail', icon: '⛈️', severity: 'bad' },
  99: { description: 'Severe thunderstorm', icon: '⛈️', severity: 'bad' },
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  let coords = { lat: 0, lon: 0 }

  if (lat && lon) {
    coords = { lat: parseFloat(lat), lon: parseFloat(lon) }
  } else if (address) {
    const geocoded = await geocodeAddress(address)
    if (!geocoded) {
      return NextResponse.json({ error: 'Could not geocode address' }, { status: 400 })
    }
    coords = { lat: geocoded.lat, lon: geocoded.lon }
  } else {
    return NextResponse.json({ error: 'Provide address or lat/lon coordinates' }, { status: 400 })
  }

  const weatherData = await getWeather(coords.lat, coords.lon)
  if (!weatherData) {
    return NextResponse.json({ error: 'Could not fetch weather data' }, { status: 500 })
  }

  // Parse the response
  const current = {
    temperature: Math.round(weatherData.current.temperature_2m),
    temperatureUnit: weatherData.current_units.temperature_2m,
    windSpeed: Math.round(weatherData.current.wind_speed_10m),
    windUnit: weatherData.current_units.wind_speed_10m,
    ...weatherCodes[weatherData.current.weather_code] || { description: 'Unknown', icon: '❓', severity: 'good' },
  }

  const forecast = weatherData.daily.time.map((date: string, i: number) => ({
    date,
    dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    tempHigh: Math.round(weatherData.daily.temperature_2m_max[i]),
    tempLow: Math.round(weatherData.daily.temperature_2m_min[i]),
    precipChance: weatherData.daily.precipitation_probability_max[i],
    windSpeed: Math.round(weatherData.daily.wind_speed_10m_max[i]),
    ...weatherCodes[weatherData.daily.weather_code[i]] || { description: 'Unknown', icon: '❓', severity: 'good' },
  }))

  // Determine work conditions for tree service
  const workConditions = forecast.map((day: any) => {
    if (day.severity === 'bad') {
      return { ...day, workSafe: false, reason: `${day.description} - not safe for tree work` }
    }
    if (day.windSpeed > 25) {
      return { ...day, workSafe: false, reason: `High winds (${day.windSpeed} km/h) - not safe for climbing` }
    }
    if (day.precipChance > 70) {
      return { ...day, workSafe: false, reason: `High rain chance (${day.precipChance}%) - reschedule recommended` }
    }
    if (day.severity === 'caution') {
      return { ...day, workSafe: true, reason: `${day.description} - proceed with caution` }
    }
    return { ...day, workSafe: true, reason: 'Good conditions for tree work' }
  })

  return NextResponse.json({
    location: { lat: coords.lat, lon: coords.lon },
    current,
    forecast: workConditions,
    timezone: weatherData.timezone,
  })
}
