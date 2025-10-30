'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface Venue {
  id: string
  name: string
  lat: number
  lng: number
  type: 'cafe' | 'bar' | 'nightclub' | 'restaurant'
  checkIns: number
}

const mockVenues: Venue[] = [
  { id: '1', name: 'The Golden Gate', lat: 37.7749, lng: -122.4194, type: 'bar', checkIns: 12 },
  { id: '2', name: 'Mission Coffee', lat: 37.7599, lng: -122.4148, type: 'cafe', checkIns: 8 },
  { id: '3', name: 'Castro Night Club', lat: 37.7626, lng: -122.4353, type: 'nightclub', checkIns: 31 },
  { id: '4', name: 'Sunset Restaurant', lat: 37.7694, lng: -122.4862, type: 'restaurant', checkIns: 15 },
  { id: '5', name: 'Downtown Bar', lat: 37.7879, lng: -122.3989, type: 'bar', checkIns: 19 },
]

const venueTypeColors: Record<string, { bg: string; border: string }> = {
  cafe: { bg: '#8B4513', border: '#D2691E' },
  bar: { bg: '#FF6347', border: '#FF8C00' },
  nightclub: { bg: '#8B008B', border: '#DA70D6' },
  restaurant: { bg: '#228B22', border: '#32CD32' },
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isReady, setIsReady] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)

  useEffect(() => {
    let mounted = true

    const initMap = async () => {
      if (!mapRef.current) return

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        await new Promise((resolve) => {
          link.onload = resolve
          setTimeout(resolve, 1000)
        })
      }

      // Import Leaflet
      const L = (await import('leaflet')).default

      if (!mounted || !mapRef.current) return

      // Initialize map
      const map = L.map(mapRef.current, {
        center: [37.7749, -122.4194],
        zoom: 13,
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      mapInstanceRef.current = map
      setIsReady(true)
    }

    initMap()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Add markers
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !mockVenues.length) return

    const loadMarkers = async () => {
      const L = (await import('leaflet')).default
      const map = mapInstanceRef.current

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add new markers
      mockVenues.forEach((venue) => {
        const colors = venueTypeColors[venue.type]
        const marker = L.circleMarker([venue.lat, venue.lng], {
          radius: 12,
          fillColor: colors.bg,
          color: colors.border,
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map)

        marker.bindPopup(`
          <div style="font-family: sans-serif; width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${venue.name}</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Type:</strong> ${venue.type}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Check-ins:</strong> ${venue.checkIns}</p>
          </div>
        `)

        marker.on('click', () => setSelectedVenue(venue))
        markersRef.current.push(marker)
      })
    }

    loadMarkers()
  }, [isReady])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Map</h1>
        <p className="text-sm text-gray-600 mt-1">Explore venues and check-ins nearby</p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div
          ref={mapRef}
          className="w-full h-full rounded-lg overflow-hidden"
          style={{ minHeight: '400px' }}
        />

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-bold text-gray-900 mb-3">Venue Types</h3>
          <div className="space-y-2">
            {(Object.entries(venueTypeColors) as [string, any][]).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border-2"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                />
                <span className="text-sm text-gray-700 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-6 right-6 flex flex-col gap-2">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center text-gray-700 font-bold transition"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center text-gray-700 font-bold transition"
          >
            <Minus size={20} />
          </button>
        </div>

        {/* People Checked In Badge */}
        <div className="absolute top-6 left-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm font-medium">👥 {mockVenues.reduce((sum, v) => sum + v.checkIns, 0)} people checked in nearby</p>
        </div>
      </div>

      {/* Selected Venue Panel */}
      {selectedVenue && (
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedVenue.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                <span className="capitalize font-medium">{selectedVenue.type}</span> • {selectedVenue.checkIns} check-ins
              </p>
            </div>
            <button
              onClick={() => setSelectedVenue(null)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
