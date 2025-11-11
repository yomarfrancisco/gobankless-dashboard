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
  initialCenter = [28.0567, -26.1069], // Sandton-ish
  initialZoom = 14,
  markers = [],
  fitToMarkers = true,
  styleUrl = 'mapbox://styles/mapbox/light-v11',
  showDebug = DEBUG_MAP,
}: Props) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const loadedRef = useRef(false)
  const [logs, setLogs] = useState<string[]>([])
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    const log = (message: string) => {
      const timestamped = `${new Date().toISOString()}  ${message}`
      setLogs((prev) => [...prev.slice(-200), timestamped])
      if (showDebug) {
        console.log(`[MapboxMap] ${message}`)
      }
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
      container: containerRef.current,
      style: styleUrl,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      cooperativeGestures: true, // nicer on mobile
      preserveDrawingBuffer: false,
    })

    // Mobile UX: keep the card feel
    map.dragRotate.disable()
    map.touchZoomRotate.enable()
    map.touchZoomRotate.disableRotation()

    // Register event listeners
    map.on('load', () => {
      loadedRef.current = true
      log('event: load')

      const mbMarkers: mapboxgl.Marker[] = []

      log(`adding ${markers.length} markers`)
      markers.forEach((m) => {
        const el = document.createElement('div')
        el.style.width = '12px'
        el.style.height = '12px'
        el.style.borderRadius = '50%'
        el.style.background = m.kind === 'dealer' ? '#ff9b26' : '#58cdaa'
        el.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.08)'
        el.title = m.label ?? m.id

        const mk = new mapboxgl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .addTo(map)

        mbMarkers.push(mk)
        log(`marker added: ${m.id} at [${m.lng}, ${m.lat}]`)
      })

      if (fitToMarkers && mbMarkers.length) {
        const bounds = new mapboxgl.LngLatBounds()
        mbMarkers.forEach((mk) => bounds.extend(mk.getLngLat()))
        map.fitBounds(bounds, { padding: 32, duration: 0 })
        log('fitted bounds to markers')
      }

      // Trigger resize after markers are added
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize()
          log('resize after load')
        }
      }, 0)
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

    // ResizeObserver for container size changes
    const resizeObserver = shellRef.current
      ? new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.resize()
            log('resizeObserver → map.resize()')
          }
        })
      : null

    if (resizeObserver && shellRef.current) {
      resizeObserver.observe(shellRef.current)
    }

    // Handle orientation change
    const handleOrientationChange = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.resize()
          log('orientationchange → map.resize()')
        }, 100)
      }
    }
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      clearTimeout(retryTimeout)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('orientationchange', handleOrientationChange)
      log('cleanup—remove map')
      map.remove()
      mapRef.current = null
    }
  }, [initialCenter, initialZoom, styleUrl, fitToMarkers, markers, showDebug])

  return (
    <div ref={shellRef} className={`${styles.mapShell} ${className || ''}`}>
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
      <div
        ref={containerRef}
        className={styles.map}
        style={{ width: '100%', height: '100%' }}
      />
      {showDebug && (
        <pre className={styles.debug}>{logs.join('\n')}</pre>
      )}
    </div>
  )
}

