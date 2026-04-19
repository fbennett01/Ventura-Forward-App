'use client'
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MiniMapProps {
  lat: number
  lng: number
  height?: number
}

export function MiniMap({ lat, lng, height = 128 }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 15,
      interactive: false,
      attributionControl: false,
    })
    mapRef.current = map

    // Custom pulsing marker
    const el = document.createElement('div')
    el.style.cssText = `
      width: 20px; height: 20px; position: relative;
    `
    el.innerHTML = `
      <div style="
        position: absolute; inset: 0; border-radius: 50%;
        background: #D7EBFF; border: 2px solid white;
        box-shadow: 0 0 0 0 rgba(160,210,255,0.45);
        animation: pulse-ring 2s ease-out infinite;
      "></div>
      <style>
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(160,210,255,0.45); }
          70% { box-shadow: 0 0 0 12px rgba(160,210,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(160,210,255,0); }
        }
      </style>
    `

    new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ height }}
    />
  )
}