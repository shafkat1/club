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

        // Create custom icon
        const icon = L.divIcon({
          html: `
            <div style="
              background: ${colors.bg};
              border: 3px solid ${colors.border};
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
              ${venue.checkIns}
            </div>
          `,
          iconSize: [40, 40],
          className: 'venue-marker',
        })

        const marker = L.marker([venue.lat, venue.lng], { icon }).addTo(map)

        marker.on('click', () => {
          setSelectedVenue(venue)
        })

        markersRef.current.push(marker)
      })
    }

    loadMarkers()
  }, [isReady])

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Venues Nearby</h1>
            <p className="text-gray-600 mt-1">Discover bars, cafes & nightclubs around you</p>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">👥 124 people checked in nearby</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={mapRef} className="w-full h-full" />

        {/* Venue Type Legend */}
        <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <p className="text-sm font-semibold text-gray-900 mb-3">Venue Types</p>
          <div className="space-y-2">
            {Object.entries(venueTypeColors).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: colors.bg, border: `2px solid ${colors.border}` }}
                />
                <span className="text-sm text-gray-700 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-40">
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomIn()
              }
            }}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-md transition"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomOut()
              }
            }}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-md transition"
          >
            <Minus className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Selected Venue Info */}
        {selectedVenue && (
          <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-40 max-w-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedVenue.name}</h3>
                <p className="text-sm text-gray-600 capitalize mt-1">{selectedVenue.type}</p>
              </div>
              <button
                onClick={() => setSelectedVenue(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{selectedVenue.checkIns}</p>
                <p className="text-xs text-gray-600 mt-1">Check-ins</p>
              </div>
              <div className="col-span-2">
                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                  📍 Check In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
