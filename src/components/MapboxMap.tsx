'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Feature, LineString } from 'geojson'
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
  const [routeData, setRouteData] = useState<Feature<LineString> | null>(null)
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null)

  const log = (message: string) => {
    const timestamped = `${new Date().toISOString()}  ${message}`
    logsRef.current = [...logsRef.current.slice(-200), timestamped]
    if (showDebug) {
      console.log(`[MapboxMap] ${message}`)
      // Update state only for debug display, throttled
      setLogs([...logsRef.current])
    }
  }

  // Haversine distance helpers (reusable)
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371000
  const distMeters = (a: [number, number], b: [number, number]) => {
    const dLat = toRad(b[1] - a[1])
    const dLng = toRad(b[0] - a[0])
    const lat1 = toRad(a[1])
    const lat2 = toRad(b[1])
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(s))
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
        trackUserLocation: true,
        showUserLocation: false, // hide default dot
        showAccuracyCircle: false,
      })

      map.addControl(geolocate, 'top-right')

      // Helper to (re)place custom user marker
      function upsertUserMarker(lng: number, lat: number) {
        // create DOM element once
        let el = userMarkerRef.current?.getElement()
        if (!el) {
          el = document.createElement('div')
          el.className = styles.userMarker
          // add our PNG as <img> to preserve sharpness on retina
          const img = document.createElement('img')
          img.alt = 'You are here'
          img.src = '/assets/character.png' // from /public
          el.appendChild(img)
          userMarkerRef.current = new mapboxgl.Marker({
            element: el,
            anchor: 'center',
          })
            .setLngLat([lng, lat])
            .addTo(map)
        } else {
          userMarkerRef.current!.setLngLat([lng, lat])
        }
      }

      let centeredOnce = false

      geolocate.on('geolocate', (e: any) => {
        const lng = e.coords.longitude
        const lat = e.coords.latitude

        // Update custom user marker on every geolocate event
        upsertUserMarker(lng, lat)

        // (optional) keep map centered on the user when first found
        if (!centeredOnce) {
          centeredOnce = true
          map.setCenter([lng, lat])
          // Set user location state (will trigger zoom effect)
          setUserLngLat([lng, lat])
          console.log('[Mapbox] Centered on user:', { lng, lat })
        } else {
          // Update user location state for route recalculation
          setUserLngLat([lng, lat])
        }
      })

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
      // Clean up user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
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
    if (!map) return
    if (!loadedRef.current) return // ensure map is fully loaded
    if (!userLngLat) return
    if (!markers?.length) return

    // Filter branches
    const branches = markers.filter((m) => m.kind === 'branch')
    if (!branches.length) return

    const [userLng, userLat] = userLngLat

    // Find nearest branch
    let nearest = branches[0]
    let best = distMeters([userLng, userLat], [nearest.lng, nearest.lat])
    for (let i = 1; i < branches.length; i++) {
      const d = distMeters([userLng, userLat], [branches[i].lng, branches[i].lat])
      if (d < best) {
        best = d
        nearest = branches[i]
      }
    }

    // Compute zoom so that distance to nearest branch fits inside current viewport
    // while keeping user at center. We do this by ensuring the distance fits
    // into min(halfWidth, halfHeight) minus padding, using meters-per-pixel.
    const container = map.getContainer()
    const halfW = container.clientWidth / 2
    const halfH = container.clientHeight / 2
    const padding = 32 // px safe padding
    const usable = Math.max(1, Math.min(halfW, halfH) - padding) // px to edge

    // meters-per-pixel at given latitude and zoom:
    // mpp = cos(lat)*2πR / (256 * 2^z)  =>  z = log2(cos(lat)*2πR / (256*mpp))
    const circ = 2 * Math.PI * R
    const metersPerPixelNeeded = best / usable
    const rawZoom = Math.log2(
      (Math.cos(toRad(userLat)) * circ) / (256 * Math.max(1e-6, metersPerPixelNeeded))
    )
    const targetZoom = Math.min(16, Math.max(3, rawZoom)) // clamp

    // Center stays on user, only zoom changes
    // Debounce micro-bursts from geolocate with rAF
    requestAnimationFrame(() => {
      // Make sure center is the user (in case geolocate ran earlier)
      map.setCenter([userLng, userLat])
      map.easeTo({ zoom: targetZoom, duration: 500 })
      if (process.env.NODE_ENV !== 'production') {
        console.debug(
          '[map] user @',
          userLngLat,
          'nearest branch @',
          [nearest.lng, nearest.lat],
          'dist(m)=',
          Math.round(best),
          'zoom=',
          targetZoom.toFixed(2)
        )
      }
    })
  }, [userLngLat, markers]) // not depending on initialZoom/Center; we only care once user+markers exist

  // Effect 1: Fetch route from user to nearest branch
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!loadedRef.current) return
    if (!userLngLat) return
    if (!markers?.length) return

    const branches = markers.filter((m) => m.kind === 'branch')
    if (!branches.length) return

    const [userLng, userLat] = userLngLat

    // Find nearest branch
    let nearest = branches[0]
    let best = distMeters([userLng, userLat], [nearest.lng, nearest.lat])
    for (let i = 1; i < branches.length; i++) {
      const d = distMeters([userLng, userLat], [branches[i].lng, branches[i].lat])
      if (d < best) {
        best = d
        nearest = branches[i]
      }
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[map] no token; using straight-line fallback route')
      }
      setRouteData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [userLng, userLat],
            [nearest.lng, nearest.lat],
          ],
        },
        properties: {},
      })
      return
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${nearest.lng},${nearest.lat}?geometries=geojson&overview=full&access_token=${token}`

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((json) => {
        const geom = json?.routes?.[0]?.geometry
        if (geom?.type === 'LineString') {
          setRouteData({ type: 'Feature', geometry: geom, properties: {} })
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[map] directions route loaded', {
              branch: nearest.label || nearest.id,
              meters: Math.round(best),
            })
          }
        } else {
          // Fallback
          setRouteData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [userLng, userLat],
                [nearest.lng, nearest.lat],
              ],
            },
            properties: {},
          })
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[map] directions missing geometry; using fallback line')
          }
        }
      })
      .catch(() => {
        setRouteData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [userLng, userLat],
              [nearest.lng, nearest.lat],
            ],
          },
          properties: {},
        })
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[map] directions fetch failed; using fallback line')
        }
      })
  }, [userLngLat, markers])

  // Effect 2: Draw / update route layer
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return

    const srcId = 'route-user-branch'
    const layerId = 'route-user-branch-line'

    if (!routeData) {
      // Remove if previously added
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getSource(srcId)) map.removeSource(srcId)
      return
    }

    if (!map.getSource(srcId)) {
      map.addSource(srcId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [routeData] },
      })
    } else {
      const src = map.getSource(srcId) as mapboxgl.GeoJSONSource
      src.setData({ type: 'FeatureCollection', features: [routeData] })
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: srcId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#111111',
          'line-opacity': 0.85,
          'line-width': 4,
          'line-blur': 0.5,
        },
      })
    }
  }, [routeData])

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

