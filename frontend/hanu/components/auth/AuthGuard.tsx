'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isMounted, router])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) return null

  // If not authenticated, we're redirecting, so show nothing to prevent flash of content
  if (!isAuthenticated) return null

  return <>{children}</>
}
