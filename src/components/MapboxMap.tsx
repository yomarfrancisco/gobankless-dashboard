'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from './MapboxMap.module.css'

export type Marker = {
  id: string
  lng: number
  lat: number
  kind?: 'dealer' | 'branch'
  label?: string
}

interface Props {
  className?: string
  containerId?: string // ID of existing container element
  initialCenter?: [number, number] // [lng, lat]
  initialZoom?: number
  markers?: Marker[]
  fitToMarkers?: boolean
  styleUrl?: string // e.g. "mapbox://styles/mapbox/light-v11"
  showDebug?: boolean
}

const DEBUG_MAP =
  process.env.NEXT_PUBLIC_DEBUG_MAP === '1' ||
  (typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debugMap') === '1')

export default function MapboxMap({
  className,
  containerId,
  initialCenter = [28.0567, -26.1069], // Sandton-ish
  initialZoom = 14,
  markers = [],
  fitToMarkers = true,
  styleUrl = 'mapbox://styles/mapbox/light-v11',
  showDebug = DEBUG_MAP,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const loadedRef = useRef(false)
  const roRef = useRef<ResizeObserver | null>(null)
  const lastSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const logsRef = useRef<string[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [hasError, setHasError] = useState(false)

  const log = (message: string) => {
    const timestamped = `${new Date().toISOString()}  ${message}`
    logsRef.current = [...logsRef.current.slice(-200), timestamped]
    if (showDebug) {
      console.log(`[MapboxMap] ${message}`)
      // Update state only for debug display, throttled
      setLogs([...logsRef.current])
    }
  }

  // Initialize map exactly once
  useEffect(() => {
    // Get container - either by ID or ref
    const container = containerId
      ? document.getElementById(containerId)
      : containerRef.current

    if (!container) {
      log('error: container not found')
      return
    }

    // Guard: prevent double initialization
    if (mapRef.current) {
      log('skip: map already initialized')
      return
    }

    // Ensure container is empty
    if (container.children.length > 0) {
      log('warning: container has children, clearing')
      container.innerHTML = ''
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
    log(`init style=${styleUrl} token=${token.slice(0, 8)}…`)

    if (!token) {
      log('error: no token found')
      setHasError(true)
      return
    }

    mapboxgl.accessToken = token

    log('construct map')
    const map = new mapboxgl.Map({
      container: container,
      style: styleUrl,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      cooperativeGestures: true,
      preserveDrawingBuffer: false,
    })

    // Mobile UX: keep the card feel
    map.dragRotate.disable()
    map.touchZoomRotate.enable()
    map.touchZoomRotate.disableRotation()

    // Register event listeners - NO state updates inside
    map.on('load', () => {
      loadedRef.current = true
      log('event: load')

      // Trigger resize after load - use requestAnimationFrame to avoid reflow
      requestAnimationFrame(() => {
        if (mapRef.current) {
          mapRef.current.resize()
          log('resize after load (raf)')
        }
      })
    })

    map.on('styledata', () => {
      log('event: styledata')
    })

    map.on('idle', () => {
      log('event: idle')
    })

    map.on('error', (e) => {
      const errorMsg = e?.error?.message ?? 'unknown'
      log(`event: error → ${errorMsg}`)
      // Only set error state, no other state updates
      setHasError(true)
    })

    map.on('remove', () => {
      log('event: remove')
    })

    // Retry if styledata hasn't fired within 3s
    const retryTimeout = setTimeout(() => {
      if (!loadedRef.current && mapRef.current) {
        mapRef.current.setStyle(styleUrl)
        log('retry: setStyle again')
      }
    }, 3000)

    mapRef.current = map

    // Throttled ResizeObserver with size checks
    let rafId = 0
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (!cr) return

      const w = Math.round(cr.width)
      const h = Math.round(cr.height)

      // Ignore zero size
      if (w === 0 || h === 0) {
        log(`resizeObserver: zero size (${w}x${h}), skipping`)
        return
      }

      // Ignore unchanged size
      if (w === lastSizeRef.current.w && h === lastSizeRef.current.h) {
        return
      }

      lastSizeRef.current = { w, h }
      log(`resizeObserver: size changed to ${w}x${h}`)

      // Throttle with requestAnimationFrame
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (mapRef.current) {
          mapRef.current.resize()
          log('resizeObserver → map.resize() (raf)')
        }
      })
    })

    ro.observe(container)
    roRef.current = ro

    // Handle orientation change - throttled
    let orientationRaf = 0
    const handleOrientationChange = () => {
      cancelAnimationFrame(orientationRaf)
      orientationRaf = requestAnimationFrame(() => {
        if (mapRef.current) {
          mapRef.current.resize()
          log('orientationchange → map.resize() (raf)')
        }
      })
    }
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      clearTimeout(retryTimeout)
      cancelAnimationFrame(rafId)
      cancelAnimationFrame(orientationRaf)
      if (roRef.current) {
        roRef.current.disconnect()
        roRef.current = null
      }
      window.removeEventListener('orientationchange', handleOrientationChange)
      log('cleanup—remove map')
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [styleUrl, containerId, showDebug]) // Minimal deps - only styleUrl and containerId

  // Separate effect to add/update markers when map is loaded (without re-initializing map)
  useEffect(() => {
    if (!mapRef.current || !loadedRef.current) return

    const log = (message: string) => {
      const timestamped = `${new Date().toISOString()}  ${message}`
      logsRef.current = [...logsRef.current.slice(-200), timestamped]
      if (showDebug) {
        console.log(`[MapboxMap] ${message}`)
        setLogs([...logsRef.current])
      }
    }

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapbox-marker')
    existingMarkers.forEach((m) => m.remove())

    if (markers.length === 0) {
      log('no markers to add')
      return
    }

    // Add new markers
    log(`adding ${markers.length} markers`)
    const mbMarkers: mapboxgl.Marker[] = []
    markers.forEach((m) => {
      const el = document.createElement('div')
      el.className = 'mapbox-marker'
      el.style.width = '12px'
      el.style.height = '12px'
      el.style.borderRadius = '50%'
      el.style.background = m.kind === 'dealer' ? '#ff9b26' : '#58cdaa'
      el.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.08)'
      el.title = m.label ?? m.id

      const mk = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(mapRef.current!)

      mbMarkers.push(mk)
      log(`marker added: ${m.id} at [${m.lng}, ${m.lat}]`)
    })

    if (fitToMarkers && mbMarkers.length) {
      const bounds = new mapboxgl.LngLatBounds()
      mbMarkers.forEach((mk) => bounds.extend(mk.getLngLat()))
      mapRef.current.fitBounds(bounds, { padding: 32, duration: 0 })
      log('fitted bounds to markers')
    }
  }, [markers, fitToMarkers, showDebug])

  // If containerId is provided, we don't render our own container
  // Fallback and debug overlay will be rendered as siblings in the parent
  if (containerId) {
    return null // Container is managed by parent, we just initialize into it
  }

  // Fallback: render our own container if no containerId
  return (
    <div ref={containerRef} className={`${styles.mapShell} ${className || ''}`}>
      {hasError && (
        <div className={styles.fallback}>
          <Image
            src="/assets/map.png"
            alt="Johannesburg/Sandton map (fallback)"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      {showDebug && (
        <pre className={styles.debug}>{logs.join('\n')}</pre>
      )}
    </div>
  )
}

