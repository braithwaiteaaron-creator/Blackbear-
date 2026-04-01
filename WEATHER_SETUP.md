# Weather Alerts API Setup Guide

## Getting Your OpenWeather API Key

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Generate an API key in your account dashboard
4. Add this to your Vercel project environment variables:
   - Go to project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_OPENWEATHER_API_KEY=YOUR_API_KEY_HERE`

## Features Enabled

✅ Real-time wind speed monitoring (alerts at >40 km/h)
✅ Lightning/thunderstorm detection  
✅ Auto-refresh every 15 minutes
✅ Dismissible alerts
✅ Manual refresh button
✅ Severity levels (low, moderate, high)

## How It Works

- The app fetches real weather data for Toronto area
- Automatically detects severe wind (>40 km/h) and lightning warnings
- Shows alerts on the dashboard when conditions are dangerous
- Perfect for storm chasing mode on routes

## Environment Variable
Add to your .env.local:
```
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_free_api_key_here
```
