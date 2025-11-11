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

    // Function to load ATMs near a location
    const loadATMsNear = async (lng: number, lat: number) => {
      if (!mapRef.current) return

      try {
        const token = mapboxgl.accessToken
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/atm.json?proximity=${lng},${lat}&types=poi&limit=15&access_token=${token}`
        
        log(`fetching ATMs near [${lng}, ${lat}]`)
        const response = await fetch(url)
        const data = await response.json()

        if (!data.features || data.features.length === 0) {
          log('no ATMs found')
          return
        }

        // Create GeoJSON from results
        const atmGeoJSON = {
          type: 'FeatureCollection' as const,
          features: data.features.map((f: any) => ({
            type: 'Feature' as const,
            geometry: f.geometry,
            properties: { name: f.text || 'ATM' },
          })),
        }

        // Remove existing ATM source/layer if present
        if (mapRef.current.getSource('atm-src')) {
          if (mapRef.current.getLayer('atm-layer')) {
            mapRef.current.removeLayer('atm-layer')
          }
          mapRef.current.removeSource('atm-src')
        }

        // Add ATM source and layer
        mapRef.current.addSource('atm-src', {
          type: 'geojson',
          data: atmGeoJSON,
        })

        mapRef.current.addLayer({
          id: 'atm-layer',
          type: 'circle',
          source: 'atm-src',
          paint: {
            'circle-radius': 6,
            'circle-color': '#F59E0B',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
          },
        })

        log(`added ${atmGeoJSON.features.length} ATM markers`)
      } catch (error) {
        log(`error loading ATMs: ${error}`)
      }
    }

    // Haversine distance helper (km)
    const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
      const R = 6371 // km
      const dLat = ((b.lat - a.lat) * Math.PI) / 180
      const dLng = ((b.lng - a.lng) * Math.PI) / 180
      const la1 = (a.lat * Math.PI) / 180
      const la2 = (b.lat * Math.PI) / 180
      const s =
        Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
      return 2 * R * Math.asin(Math.sqrt(s))
    }

    // Get branches from map source
    const getBranches = (): Array<{ id: string; lng: number; lat: number; name: string }> => {
      if (!mapRef.current) return []

      try {
        const source = mapRef.current.getSource('branch-src') as mapboxgl.GeoJSONSource
        if (!source || !source._data) return []

        const data = source._data as GeoJSON.FeatureCollection
        if (!data.features) return []

        return data.features.map((f, idx) => {
          const coords = (f.geometry as GeoJSON.Point).coordinates
          return {
            id: f.properties?.id || `branch-${idx}`,
            lng: coords[0],
            lat: coords[1],
            name: f.properties?.name || 'Branch',
          }
        })
      } catch (error) {
        log(`error getting branches: ${error}`)
        return []
      }
    }

    // Find nearest branch to user location
    const nearestBranch = (user: { lat: number; lng: number }) => {
      const branches = getBranches()
      if (branches.length === 0) return { branch: null, distanceKm: Infinity }

      let best = null as { id: string; lng: number; lat: number; name: string } | null
      let bestD = Infinity

      for (const br of branches) {
        const d = haversineKm(user, { lat: br.lat, lng: br.lng })
        if (d < bestD) {
          bestD = d
          best = br
        }
      }

      return { branch: best, distanceKm: bestD }
    }

    // Auto-center logic with 100km rule
    const handleAutoCenter = (user: { lat: number; lng: number }) => {
      if (!mapRef.current) return

      const { branch, distanceKm } = nearestBranch(user)

      if (!branch) {
        log('no branches available for auto-center')
        return
      }

      log(`nearest branch: ${branch.name} at ${distanceKm.toFixed(1)}km`)

      if (distanceKm <= 100) {
        // Show both user and nearest branch
        const bounds = new mapboxgl.LngLatBounds()
        bounds.extend([user.lng, user.lat])
        bounds.extend([branch.lng, branch.lat])
        mapRef.current.fitBounds(bounds, { padding: 64, maxZoom: 15, duration: 700 })
        log(`fitted bounds to user and branch (${distanceKm.toFixed(1)}km away)`)
      } else {
        // Center on branch and show ~50 km radius
        const lat = branch.lat
        const lng = branch.lng
        const dLat = 50 / 111.32 // ~deg for 50km
        const kmPerDegLon = 111.32 * Math.cos((lat * Math.PI) / 180)
        const dLng = 50 / kmPerDegLon

        const bounds = new mapboxgl.LngLatBounds(
          [lng - dLng, lat - dLat],
          [lng + dLng, lat + dLat]
        )
        mapRef.current.fitBounds(bounds, { padding: 64, duration: 700 })
        log(`centered on branch (${distanceKm.toFixed(1)}km away), showing 50km radius`)
      }
    }

    // Function to add test branches
    const addTestBranches = () => {
      if (!mapRef.current) return

      const branches = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [28.0549, -26.1077] as [number, number],
            },
            properties: { name: 'GoB Sandton', id: 'sandton' },
          },
          {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [28.0325, -26.1372] as [number, number],
            },
            properties: { name: 'GoB Rosebank', id: 'rosebank' },
          },
        ],
      }

      // Add branch source
      mapRef.current.addSource('branch-src', {
        type: 'geojson',
        data: branches,
      })

      // Add branch layer
      mapRef.current.addLayer({
        id: 'branch-layer',
        type: 'circle',
        source: 'branch-src',
        paint: {
          'circle-radius': 7,
          'circle-color': '#D9368B',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // Add click handler for branch popups
      mapRef.current.on('click', 'branch-layer', (e) => {
        if (!e.features || e.features.length === 0) return

        const feature = e.features[0]
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number]
        const name = feature.properties?.name || 'Branch'

        // Create popup
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<div style="padding: 8px;"><strong>${name}</strong><br/>Convert here</div>`)
          .addTo(mapRef.current!)
      })

      // Change cursor on hover
      mapRef.current.on('mouseenter', 'branch-layer', () => {
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = 'pointer'
        }
      })

      mapRef.current.on('mouseleave', 'branch-layer', () => {
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = ''
        }
      })

      log('added 2 test branch locations')
    }

    // Function to hide Mapbox logo
    const hideMapboxLogo = () => {
      // Wait a bit for logo to render
      setTimeout(() => {
        const attribution = document.querySelector('.mapboxgl-ctrl-logo') as HTMLElement
        if (attribution) {
          attribution.style.position = 'absolute'
          attribution.style.bottom = '-200px'
          log('moved Mapbox logo offscreen')
        }
      }, 500)
    }

    // Function to enable 3D terrain and buildings
    const enable3DTerrain = () => {
      if (!mapRef.current) return

      try {
        // Add DEM terrain source
        mapRef.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        })

        // Set terrain
        mapRef.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 })

        // Add 3D buildings layer
        mapRef.current.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#d1d5db',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
              'fill-extrusion-opacity': 0.6,
            },
          },
          'waterway-label'
        )

        log('enabled 3D terrain and buildings')
      } catch (error) {
        log(`error enabling 3D terrain: ${error}`)
      }
    }

    // Register event listeners - NO state updates inside
    map.on('load', () => {
      loadedRef.current = true
      log('event: load')

      // Add GeolocateControl
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })

      map.addControl(geolocate, 'top-right')

      // Debounce auto-center to prevent repeated fits
      let fitOnce = false
      let geolocateErrorHandled = false

      // Handle geolocate events
      geolocate.on('geolocate', (e: any) => {
        const { coords } = e
        const user = { lng: coords.longitude, lat: coords.latitude }
        log(`geolocate: user at [${user.lng}, ${user.lat}]`)

        // Load ATMs near user location
        loadATMsNear(user.lng, user.lat)

        // Auto-center on user and nearest branch (once)
        if (!fitOnce) {
          fitOnce = true
          // Small delay to ensure branches are loaded
          setTimeout(() => {
            handleAutoCenter(user)
          }, 300)
        }
      })

      geolocate.on('trackuserlocationstart', () => {
        log('geolocate: tracking started')
      })

      geolocate.on('trackuserlocationend', () => {
        log('geolocate: tracking ended')
      })

      geolocate.on('error', (e: any) => {
        log(`geolocate error: ${e.error?.message || 'unknown'}`)
        // Fallback: use current map center as "user" location
        if (!geolocateErrorHandled && !fitOnce) {
          geolocateErrorHandled = true
          setTimeout(() => {
            const center = map.getCenter()
            const user = { lng: center.lng, lat: center.lat }
            log(`geolocate denied, using map center as user: [${user.lng}, ${user.lat}]`)
            handleAutoCenter(user)
          }, 500)
        }
      })

      // Auto-activate geolocate on first render
      setTimeout(() => {
        try {
          geolocate.trigger()
        } catch (error) {
          log(`geolocate trigger error: ${error}`)
          // If trigger fails, use fallback
          if (!geolocateErrorHandled && !fitOnce) {
            geolocateErrorHandled = true
            setTimeout(() => {
              const center = map.getCenter()
              const user = { lng: center.lng, lat: center.lat }
              log(`geolocate unavailable, using map center: [${user.lng}, ${user.lat}]`)
              handleAutoCenter(user)
            }, 500)
          }
        }
      }, 1000)

      // Add test branches
      addTestBranches()

      // Load ATMs near initial center
      loadATMsNear(initialCenter[0], initialCenter[1])

      // Hide Mapbox logo
      hideMapboxLogo()

      // Enable 3D terrain
      enable3DTerrain()

      // Dynamic pitch on zoom
      map.on('zoom', () => {
        const z = map.getZoom()
        const targetPitch = Math.min(60, Math.max(0, (z - 12) * 7))
        map.setPitch(targetPitch)
      })

      // Debounced ATM refresh on moveend
      let moveendTimeout: NodeJS.Timeout
      map.on('moveend', () => {
        clearTimeout(moveendTimeout)
        moveendTimeout = setTimeout(() => {
          const center = map.getCenter()
          loadATMsNear(center.lng, center.lat)
        }, 500)
      })

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

