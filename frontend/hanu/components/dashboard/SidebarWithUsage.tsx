'use client'

import { useEffect } from 'react'
import Sidebar from './Sidebar'
import { useUsage } from '@/hooks/useUsage'
import { useTTSStore } from '@/stores/ttsStore'

export default function SidebarWithUsage() {
  const { usagePercent, usageUsed, usageTotal, refreshUsage } = useUsage()

  // Register the refresh callback so TTS store can trigger it after generation
  useEffect(() => {
    useTTSStore.getState().setUsageRefresh(refreshUsage)
    return () => { useTTSStore.getState().setUsageRefresh(null) }
  }, [refreshUsage])

  return (
    <Sidebar
      usagePercent={usagePercent}
      usageUsed={usageUsed}
      usageTotal={usageTotal}
    />
  )
}
