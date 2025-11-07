'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function usePullToRefresh(containerId: string) {
  const startY = useRef<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const el = document.getElementById(containerId)
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (startY.current === null) return

      const dy = e.changedTouches[0].clientY - startY.current
      startY.current = null

      if (dy > 60) {
        router.refresh()
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [containerId, router])
}

