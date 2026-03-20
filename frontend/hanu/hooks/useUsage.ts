'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

interface UsageData {
  plan: string
  tts_minutes_used: number
  tts_minutes_total: number
  stt_minutes_used: number
  stt_minutes_total: number
  clones_used: number
  clones_total: number
}

interface UseUsageReturn {
  usagePercent: number
  usageUsed: string
  usageTotal: string
  isLoading: boolean
  refreshUsage: () => Promise<void>
}

export function useUsage(): UseUsageReturn {
  const [data, setData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsage = useCallback(async () => {
    try {
      const result = await api.backendGet<UsageData>('/api/v1/user/usage')
      setData(result)
    } catch {
      // Silently fail — sidebar will show defaults
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsage()
    const interval = setInterval(fetchUsage, 5 * 60 * 1000) // Poll every 5 minutes
    return () => clearInterval(interval)
  }, [fetchUsage])

  if (!data) {
    return { usagePercent: 0, usageUsed: '0 min', usageTotal: '—', isLoading, refreshUsage: fetchUsage }
  }

  const total = data.tts_minutes_total === -1 ? Infinity : data.tts_minutes_total
  const used = data.tts_minutes_used
  const percent = total === Infinity ? 0 : total === 0 ? 100 : Math.min(100, Math.round((used / total) * 100))
  const totalLabel = total === Infinity ? 'Unlimited' : `${Math.round(total)} min`
  const usedLabel = `${Math.round(used * 100) / 100} min`

  return { usagePercent: percent, usageUsed: usedLabel, usageTotal: totalLabel, isLoading, refreshUsage: fetchUsage }
}
