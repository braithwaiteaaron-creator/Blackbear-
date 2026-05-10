'use client'

import { useEffect, useState } from 'react'

interface RevenueGaugeProps {
  current: number
  target?: number
  label?: string
}

export function RevenueGauge({ current, target = 10000, label = 'Revenue MTD' }: RevenueGaugeProps) {
  const [percentage, setPercentage] = useState(0)
  
  useEffect(() => {
    setPercentage(Math.min((current / target) * 100, 100))
  }, [current, target])

  const displayCurrent = current.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const displayTarget = target.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <span className="text-lg font-bold text-primary">{displayCurrent}</span>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">$0</span>
        <span className="text-xs text-muted-foreground font-medium">{Math.round(percentage)}%</span>
        <span className="text-xs text-muted-foreground">{displayTarget}</span>
      </div>
    </div>
  )
}
