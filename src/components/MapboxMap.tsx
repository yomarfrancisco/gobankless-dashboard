'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

type Marker = {
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
}

export default function MapboxMap({
  className,
  initialCenter = [28.0567, -26.1069], // Sandton-ish
  initialZoom = 14,
  markers = [],
  fitToMarkers = true,
  styleUrl = 'mapbox://styles/mapbox/light-v11',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

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

    // Add markers
    map.on('load', () => {
      const mbMarkers: mapboxgl.Marker[] = []

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
      })

      if (fitToMarkers && mbMarkers.length) {
        const bounds = new mapboxgl.LngLatBounds()
        mbMarkers.forEach((mk) => bounds.extend(mk.getLngLat()))
        map.fitBounds(bounds, { padding: 32, duration: 0 })
      }
    })

    mapRef.current = map

    return () => map.remove()
  }, [initialCenter, initialZoom, styleUrl, fitToMarkers, markers])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

