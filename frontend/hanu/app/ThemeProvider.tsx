'use client'

import { useLayoutEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'

export function ThemeProvider() {
  const initTheme = useThemeStore(s => s.initTheme)

  useLayoutEffect(() => {
    initTheme()
  }, [initTheme])

  return null
}
