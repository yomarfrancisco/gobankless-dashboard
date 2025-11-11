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
  const [userLngLat, setUserLngLat] = useState<[number, number] | null>(null)

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

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        showUserLocation: true,
        trackUserLocation: false,
      })

      map.addControl(geolocate, 'top-right')

      // Trigger geolocate after a short delay
      setTimeout(() => {
        try {
          geolocate.trigger()
        } catch (err) {
          console.warn('[Mapbox] Geolocate trigger failed', err)
        }
      }, 500)

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
    if (!mapRef.current || !loadedRef.current || !markers) return

    const log = (message: string) => {
      const timestamped = `${new Date().toISOString()}  ${message}`
      logsRef.current = [...logsRef.current.slice(-200), timestamped]
      if (showDebug) {
        console.log(`[MapboxMap] ${message}`)
        setLogs([...logsRef.current])
      }
    }

    // Track created markers for cleanup
    const created: mapboxgl.Marker[] = []

    // Clear existing markers by removing all markers from the map
    // We'll track new ones and clean them up on unmount
    if (markers.length === 0) {
      log('no markers to add')
      return
    }

    // Add new markers using Mapbox default marker
    log(`adding ${markers.length} markers`)
    markers.forEach((m) => {
      const marker = new mapboxgl.Marker() // default Mapbox pin
        .setLngLat([m.lng, m.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setText(m.label ?? ''))
        .addTo(mapRef.current!)

      created.push(marker)
      log(`marker added: ${m.id} at [${m.lng}, ${m.lat}]`)
    })

    // Cleanup function
    return () => {
      created.forEach((marker) => marker.remove())
    }
  }, [markers, showDebug])

  // Effect to keep nearest branch in view while user stays centered
  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLngLat || !markers?.length) return

    const logMessage = (message: string) => {
      const timestamped = `${new Date().toISOString()}  ${message}`
      logsRef.current = [...logsRef.current.slice(-200), timestamped]
      if (showDebug) {
        console.log(`[MapboxMap] ${message}`)
        setLogs([...logsRef.current])
      }
    }

    // Filter branches only
    const branches = markers.filter((m) => m.kind === 'branch')
    if (!branches.length) return

    const [userLng, userLat] = userLngLat

    // Haversine distance (meters)
    const R = 6371000
    const toRad = (d: number) => (d * Math.PI) / 180
    const dist = (a: [number, number], b: [number, number]) => {
      const dLat = toRad(b[1] - a[1])
      const dLng = toRad(b[0] - a[0])
      const lat1 = toRad(a[1])
      const lat2 = toRad(b[1])
      const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
      return 2 * R * Math.asin(Math.sqrt(s))
    }

    // Find nearest branch
    let nearest = branches[0]
    let best = dist([userLng, userLat], [nearest.lng, nearest.lat])
    for (let i = 1; i < branches.length; i++) {
      const d = dist([userLng, userLat], [branches[i].lng, branches[i].lat])
      if (d < best) {
        best = d
        nearest = branches[i]
      }
    }

    // Compute zoom to include user + nearest branch; keep user centered
    const bounds = new mapboxgl.LngLatBounds()
      .extend([userLng, userLat])
      .extend([nearest.lng, nearest.lat])

    const cfb = map.cameraForBounds(bounds, {
      padding: { top: 32, right: 32, bottom: 32, left: 32 },
      maxZoom: 16,
    })

    // Apply zoom while keeping user center
    if (cfb?.zoom) {
      map.setCenter([userLng, userLat])
      map.setZoom(Math.min(cfb.zoom, 16))
      logMessage(`zoomed to show nearest branch (${nearest.label}) while keeping user centered`)
    } else {
      // Fallback to sane zoom
      map.setCenter([userLng, userLat])
      map.setZoom(12)
      logMessage('fallback zoom applied (cameraForBounds returned undefined)')
    }
  }, [userLngLat, markers, showDebug])

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

