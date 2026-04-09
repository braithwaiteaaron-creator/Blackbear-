'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-900 border border-amber-700 text-amber-100 text-sm z-50">
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode - Changes will sync when online</span>
    </div>
  )
}
