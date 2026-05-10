import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Simple distance calculation using Haversine formula
// For production, integrate with Google Maps API or similar
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Geocode address to lat/lon (simplified - use real geocoding in production)
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  // For now, return mock coordinates
  // In production: integrate with Google Geocoding API or similar
  const geocodes: Record<string, { lat: number; lon: number }> = {
    '123 bear st': { lat: 40.7128, lon: -74.0060 },
    '456 oak avenue': { lat: 40.7589, lon: -73.9851 },
    '789 pine road': { lat: 40.7614, lon: -73.9776 },
    '137 sunnyslope': { lat: 40.7505, lon: -73.9972 },
    '710 foster': { lat: 40.7282, lon: -74.0076 },
    '967 comfort lane': { lat: 40.7549, lon: -73.9840 },
    '45 dearham wood': { lat: 40.7489, lon: -73.9680 },
    '20 lalton place': { lat: 40.7614, lon: -73.9776 },
  }

  const normalized = address.toLowerCase()
  return geocodes[normalized] || { lat: 40.7128, lon: -74.0060 } // Default to NYC
}

// Nearest neighbor algorithm for route optimization
function optimizeRoute(addresses: Array<{ id: string; address: string; coords: { lat: number; lon: number } }>): string[] {
  if (addresses.length <= 1) return addresses.map(a => a.id)

  const visited = new Set<string>()
  const route: string[] = []
  let current = addresses[0]
  visited.add(current.id)
  route.push(current.id)

  while (visited.size < addresses.length) {
    let nearest = null
    let minDistance = Infinity

    for (const addr of addresses) {
      if (!visited.has(addr.id)) {
        const dist = calculateDistance(
          current.coords.lat, current.coords.lon,
          addr.coords.lat, addr.coords.lon
        )
        if (dist < minDistance) {
          minDistance = dist
          nearest = addr
        }
      }
    }

    if (nearest) {
      visited.add(nearest.id)
      route.push(nearest.id)
      current = nearest
    }
  }

  return route
}

export async function POST(request: NextRequest) {
  try {
    const { date, jobIds } = await request.json()

    if (!date || !jobIds || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing date or jobIds' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get job details
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, address')
      .in('id', jobIds)

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: 'No jobs found' },
        { status: 404 }
      )
    }

    // Geocode addresses
    const jobsWithCoords = await Promise.all(
      jobs.map(async (job) => ({
        id: job.id,
        address: job.address || '',
        coords: await geocodeAddress(job.address || ''),
      }))
    )

    // Optimize route
    const optimizedIds = optimizeRoute(jobsWithCoords.filter(j => j.coords !== null) as Array<{ id: string; address: string; coords: { lat: number; lon: number } }>)

    // Create route stops
    const routeStops = optimizedIds.map((jobId, index) => ({
      job_id: jobId,
      route_date: date,
      priority: index + 1,
      address: jobsWithCoords.find(j => j.id === jobId)?.address,
      stop_type: 'job',
      estimated_time: `${String(Math.min(8 + index, 17)).padStart(2, '0')}:00`,
      completed: false,
    }))

    // Delete existing route stops for this date
    await supabase
      .from('route_stops')
      .delete()
      .eq('route_date', date)
      .in('job_id', jobIds)

    // Insert optimized route stops
    const { data: insertedStops, error } = await supabase
      .from('route_stops')
      .insert(routeStops)
      .select()

    if (error) {
      return NextResponse.json(
        { error: `Failed to save route: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      route: optimizedIds,
      stops: insertedStops,
      totalDistance: jobsWithCoords.reduce((sum, curr, idx) => {
        if (idx === 0) return sum
        const prev = jobsWithCoords.find(j => j.id === optimizedIds[idx - 1])
        if (!prev || !prev.coords || !curr.coords) return sum
        return sum + calculateDistance(prev.coords.lat, prev.coords.lon, curr.coords.lat, curr.coords.lon)
      }, 0),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: `Route optimization failed: ${error.message}` },
      { status: 500 }
    )
  }
}
