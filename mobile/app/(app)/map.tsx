import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { googlePlacesAPI, Venue } from '@/lib/googlePlacesAPI'

type SortOption = 'distance' | 'rating'
type ViewMode = 'map' | 'list'
type MapTheme = 'light' | 'dark' | 'vibrant' | 'minimalist'
type RouteMode = 'none' | 'all' | 'selected'

const { width } = Dimensions.get('window')

// Default fallback location (Buffalo if geolocation fails)
const DEFAULT_LAT = 42.8981
const DEFAULT_LON = -78.7329
const SEARCH_RADIUS_MILES = 5

// Generate circle path for 5-mile radius
const generateCirclePath = (lat: number, lon: number, radiusMiles: number): string => {
  const points = []
  const radiusRad = radiusMiles / 3959 // Convert miles to radians (Earth radius in miles)
  
  for (let i = 0; i < 36; i++) {
    const angle = (i * 10) * (Math.PI / 180)
    const y = lat + radiusRad * Math.cos(angle) * (180 / Math.PI)
    const x = lon + radiusRad * Math.sin(angle) * (180 / Math.PI) / Math.cos((lat * Math.PI) / 180)
    points.push(`${y},${x}`)
  }
  
  return points.join('|')
}

// Calculate distance between two coordinates in miles
const calculateDistanceInMiles = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Web-compatible geolocation helper
const getWebLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got user location:', position.coords.latitude, position.coords.longitude)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.warn('Geolocation error:', error.message)
          console.log('Using fallback location (Buffalo, NY)')
          resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON })
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
        }
      )
    } else {
      console.log('Geolocation not available, using fallback location')
      resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON })
    }
  })
}

// Mock venues for Buffalo area
const MOCK_BUFFALO_VENUES: Venue[] = [
  {
    id: 'venue_001',
    name: 'Moor Pat',
    type: 'bar',
    address: '6857 Main St, Williamsville, NY 14221',
    latitude: 42.9543,
    longitude: -78.7389,
    rating: 4.5,
    reviewCount: 342,
    distance: 0,
    openNow: true,
    photos: [],
  },
  {
    id: 'venue_002',
    name: 'Ration Ales',
    type: 'bar',
    address: '6917 Main St, Williamsville, NY 14221',
    latitude: 42.9549,
    longitude: -78.7391,
    rating: 4.7,
    reviewCount: 512,
    distance: 0,
    openNow: true,
    photos: [],
  },
  {
    id: 'venue_003',
    name: 'Share Kitchen & Bar Room',
    type: 'restaurant',
    address: '6500 Main St, Williamsville, NY 14221',
    latitude: 42.9512,
    longitude: -78.7365,
    rating: 4.6,
    reviewCount: 428,
    distance: 0,
    openNow: true,
    photos: [],
  },
  {
    id: 'venue_004',
    name: 'Cabernet Cafe',
    type: 'cafe',
    address: '6470 Main St, Williamsville, NY 14221',
    latitude: 42.9508,
    longitude: -78.7362,
    rating: 4.4,
    reviewCount: 286,
    distance: 0,
    openNow: true,
    photos: [],
  },
  {
    id: 'venue_005',
    name: 'Abbey Square',
    type: 'nightclub',
    address: '452 Pearl St, Buffalo, NY 14202',
    latitude: 42.8863,
    longitude: -78.8797,
    rating: 4.3,
    reviewCount: 374,
    distance: 0,
    openNow: true,
    photos: [],
  },
  {
    id: 'venue_006',
    name: 'The Terrace Restaurant',
    type: 'restaurant',
    address: '6675 Transit Rd, Williamsville, NY 14221',
    latitude: 42.9528,
    longitude: -78.7409,
    rating: 4.5,
    reviewCount: 298,
    distance: 0,
    openNow: true,
    photos: [],
  },
  {
    id: 'venue_007',
    name: 'Oshun Restaurant',
    type: 'restaurant',
    address: '53 West Huron St, Buffalo, NY 14202',
    latitude: 42.8895,
    longitude: -78.8825,
    rating: 4.6,
    reviewCount: 445,
    distance: 0,
    openNow: true,
    photos: [],
  },
  {
    id: 'venue_008',
    name: 'Salvos Pizzeria',
    type: 'restaurant',
    address: '51 Lipsey St, Buffalo, NY 14209',
    latitude: 42.8924,
    longitude: -78.8756,
    rating: 4.4,
    reviewCount: 567,
    distance: 0,
    openNow: true,
    photos: [],
  },
]

// Map theme styles
const mapThemes = {
  light: [
    'feature:all|color:0xffffff',
    'feature:water|color:0x0066ff',
    'feature:road|color:0xffffff',
    'feature:landscape|color:0xf5f5f5',
    'feature:labels|color:0x333333',
  ],
  dark: [
    'feature:all|color:0x1a1a1a',
    'feature:water|color:0x003d99',
    'feature:road|color:0x333333',
    'feature:landscape|color:0x0d0d0d',
    'feature:labels|color:0xffffff',
  ],
  vibrant: [
    'feature:all|saturation:100',
    'feature:water|color:0x00ffff',
    'feature:road|color:0xffff00',
    'feature:landscape|color:0xff00ff',
    'feature:labels|color:0x000000',
  ],
  minimalist: [
    'feature:all|visibility:off',
    'feature:water|visibility:on|color:0xdddddd',
    'feature:road|visibility:on|color:0xffffff',
    'feature:landscape|visibility:on|color:0xf5f5f5',
    'feature:labels|visibility:on|color:0x666666',
  ],
}

export default function MapScreen() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState('Detecting location...')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('distance')
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [zoomLevel, setZoomLevel] = useState(12)
  const [mapTheme, setMapTheme] = useState<MapTheme>('light')
  const [routeMode, setRouteMode] = useState<RouteMode>('none')
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showRouteMenu, setShowRouteMenu] = useState(false)
  const mapRef = useRef<any>(null)

  // Initialize with user's actual location
  useEffect(() => {
    const initializeMap = async () => {
      setLoading(true)
      setError('')
      setLocationStatus('Detecting your location...')

      try {
        // Get user's location
        const location = await getWebLocation()
        setUserLocation(location)
        setLocationStatus(`📍 Your Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)

        console.log('Fetching real venue data from Google Places...')
        
        // Try to fetch real data first
        try {
          const [restaurants, bars, nightclubs, cafes] = await Promise.all([
            googlePlacesAPI.getNearbyVenues(location.latitude, location.longitude, 'restaurant', 8047),
            googlePlacesAPI.getNearbyVenues(location.latitude, location.longitude, 'bar', 8047),
            googlePlacesAPI.getNearbyVenues(location.latitude, location.longitude, 'night_club', 8047),
            googlePlacesAPI.getNearbyVenues(location.latitude, location.longitude, 'cafe', 8047),
          ])

          const allVenues = [...restaurants, ...bars, ...nightclubs, ...cafes]
          
          if (allVenues && allVenues.length > 0) {
            console.log(`Got ${allVenues.length} total venues from Google Places`)
            
            const venuesWithDistances = allVenues.map(venue => ({
              ...venue,
              distance: calculateDistanceInMiles(
                location.latitude,
                location.longitude,
                venue.latitude,
                venue.longitude
              ),
            }))

            const venuesWithin5Miles = venuesWithDistances.filter(v => v.distance <= SEARCH_RADIUS_MILES)
            venuesWithin5Miles.sort((a, b) => (a.distance || 0) - (b.distance || 0))
            
            setVenues(venuesWithin5Miles)
            console.log(`Found ${venuesWithin5Miles.length} venues within ${SEARCH_RADIUS_MILES} miles`)
            setLoading(false)
            return
          }
        } catch (apiErr) {
          console.log('Google Places API failed, using mock data:', apiErr)
        }

        // Fallback to mock data if real API fails
        console.log('Using mock venue data...')
        const venuesWithDistances = MOCK_BUFFALO_VENUES.map(venue => ({
          ...venue,
          distance: calculateDistanceInMiles(
            location.latitude,
            location.longitude,
            venue.latitude,
            venue.longitude
          ),
        }))

        const venuesWithin5Miles = venuesWithDistances.filter(v => v.distance <= SEARCH_RADIUS_MILES)
        venuesWithin5Miles.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        
        setVenues(venuesWithin5Miles)
        console.log(`Found ${venuesWithin5Miles.length} mock venues within ${SEARCH_RADIUS_MILES} miles`)
        setLoading(false)
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Failed to load venues. Please refresh.')
        setLoading(false)
      }
    }

    initializeMap()
  }, [])

  const filteredAndSortedVenues = useMemo(() => {
    let result = venues

    if (searchQuery.trim()) {
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else {
      result = [...result].sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return result
  }, [venues, searchQuery, sortBy])

  const getVenueEmoji = (type: Venue['type']) => {
    switch (type) {
      case 'restaurant':
        return '🍽️'
      case 'bar':
        return '🍺'
      case 'nightclub':
        return '🎉'
      case 'cafe':
        return '☕'
      default:
        return '📍'
    }
  }

  const handleVenuePress = (venueId: string) => {
    setSelectedVenue(selectedVenue === venueId ? null : venueId)
  }

  const handleViewDetails = (venue: Venue) => {
    router.push({
      pathname: '/venue-details',
      params: {
        venueId: venue.id,
        venueName: venue.name,
        rating: venue.rating?.toString() || '0',
        address: venue.address,
        distance: venue.distance?.toString() || '0',
      },
    })
  }

  const handleRefresh = async () => {
    setLoading(true)
    setLocationStatus('Updating location...')
    
    try {
      const location = await getWebLocation()
      setUserLocation(location)
      setLocationStatus(`📍 Your Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)

      // Try to fetch updated venue data from Google Places
      try {
        const [restaurants, bars, nightclubs, cafes] = await Promise.all([
          googlePlacesAPI.getNearbyVenues(location.latitude, location.longitude, 'restaurant', 8047),
          googlePlacesAPI.getNearbyVenues(location.latitude, location.longitude, 'bar', 8047),
          googlePlacesAPI.getNearbyVenues(location.latitude, location.longitude, 'night_club', 8047),
          googlePlacesAPI.getNearbyVenues(location.latitude, location.longitude, 'cafe', 8047),
        ])

        const allVenues = [...restaurants, ...bars, ...nightclubs, ...cafes]
        
        if (allVenues && allVenues.length > 0) {
          const venuesWithDistances = allVenues.map(venue => ({
            ...venue,
            distance: calculateDistanceInMiles(
              location.latitude,
              location.longitude,
              venue.latitude,
              venue.longitude
            ),
          }))

          const venuesWithin5Miles = venuesWithDistances.filter(v => v.distance <= SEARCH_RADIUS_MILES)
          venuesWithin5Miles.sort((a, b) => (a.distance || 0) - (b.distance || 0))
          
          setVenues(venuesWithin5Miles)
          setLoading(false)
          return
        }
      } catch (apiErr) {
        console.log('Google Places API failed, using mock data')
      }

      // Fallback to mock data
      const venuesWithDistances = MOCK_BUFFALO_VENUES.map(venue => ({
        ...venue,
        distance: calculateDistanceInMiles(
          location.latitude,
          location.longitude,
          venue.latitude,
          venue.longitude
        ),
      }))

      const venuesWithin5Miles = venuesWithDistances.filter(v => v.distance <= SEARCH_RADIUS_MILES)
      venuesWithin5Miles.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      
      setVenues(venuesWithin5Miles)
    } catch (err) {
      console.error('Error refreshing:', err)
      setError('Failed to refresh venues. Please try again.')
    }
    
    setLoading(false)
  }

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 2, 21))
  }

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 2, 0))
  }

  // Generate enhanced Google Maps embed URL with all features
  const generateMapEmbedUrl = () => {
    if (!userLocation) return ''
    
    // Create markers for venues
    const markers = filteredAndSortedVenues
      .map((v, idx) => `markers=color:red|label:${idx + 1}|${v.latitude},${v.longitude}`)
      .join('&')
    
    // User location marker
    const userMarker = `markers=color:blue|label:YOU|${userLocation.latitude},${userLocation.longitude}`
    
    // Generate 5-mile radius circle path
    const circlePath = generateCirclePath(userLocation.latitude, userLocation.longitude, SEARCH_RADIUS_MILES)
    const circleOverlay = `path=fillcolor:0x0000ff15|color:0x0000ff99|weight:2|${circlePath}`
    
    // Generate routes to selected venue or all venues
    let routePaths = ''
    if (routeMode === 'all') {
      routePaths = filteredAndSortedVenues
        .map(v => `path=color:0x7c3aed88|weight:2|${userLocation.latitude},${userLocation.longitude}|${v.latitude},${v.longitude}`)
        .join('&')
    } else if (routeMode === 'selected' && selectedVenue) {
      const selected = filteredAndSortedVenues.find(v => v.id === selectedVenue)
      if (selected) {
        routePaths = `path=color:0x7c3aed88|weight:2|${userLocation.latitude},${userLocation.longitude}|${selected.latitude},${selected.longitude}`
      }
    }
    
    // Apply map theme
    const themeStyles = mapThemes[mapTheme].map(style => `style=${style}`).join('&')
    
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${userLocation.latitude},${userLocation.longitude}&zoom=${zoomLevel}&size=600x500&${markers}&${userMarker}&${circleOverlay}${routePaths ? '&' + routePaths : ''}&${themeStyles}&key=AIzaSyDQkZqH2UTkrh6HNls8-h-Guxo_Xi7yr64`
    return mapUrl
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Finding venues near you...</Text>
          <Text style={styles.loadingSubtext}>
            {locationStatus}
          </Text>
          <Text style={styles.loadingSubtext2}>
            🔍 Searching within {SEARCH_RADIUS_MILES} miles...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const hasVenues = venues.length > 0

  return (
    <SafeAreaView style={[styles.container, mapTheme === 'dark' && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, mapTheme === 'dark' && styles.darkHeader]}>
        <View>
          <Text style={[styles.title, mapTheme === 'dark' && styles.darkTitle]}>🍽️ Venues Near You</Text>
          <Text style={[styles.subtitle, mapTheme === 'dark' && styles.darkSubtitle]}>Within {SEARCH_RADIUS_MILES} miles</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Location Status */}
      {userLocation && (
        <View style={[styles.locationBanner, mapTheme === 'dark' && styles.darkLocationBanner]}>
          <Text style={[styles.locationText, mapTheme === 'dark' && styles.darkLocationText]}>
            📍 {locationStatus}
          </Text>
          <Text style={[styles.radiusText, mapTheme === 'dark' && styles.darkRadiusText]}>
            🎯 {SEARCH_RADIUS_MILES}-mile radius circle • Theme: {mapTheme}
          </Text>
        </View>
      )}

      {/* Control Panel */}
      <View style={[styles.controlPanel, mapTheme === 'dark' && styles.darkControlPanel]}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setViewMode('map')}
            style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleButtonText, viewMode === 'map' && styles.toggleButtonTextActive]}>
              🗺️ Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleButtonText, viewMode === 'list' && styles.toggleButtonTextActive]}>
              📋 List
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme & Route Controls */}
        {viewMode === 'map' && (
          <View style={styles.featureControls}>
            {/* Theme Button */}
            <TouchableOpacity
              onPress={() => setShowThemeMenu(!showThemeMenu)}
              style={[styles.featureButton, mapTheme === 'dark' && styles.darkFeatureButton]}
            >
              <Text style={styles.featureButtonText}>🎨 {mapTheme}</Text>
            </TouchableOpacity>

            {/* Route Button */}
            <TouchableOpacity
              onPress={() => setShowRouteMenu(!showRouteMenu)}
              style={[styles.featureButton, mapTheme === 'dark' && styles.darkFeatureButton]}
            >
              <Text style={styles.featureButtonText}>🛣️ {routeMode}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Theme Menu */}
      {showThemeMenu && (
        <View style={[styles.menu, mapTheme === 'dark' && styles.darkMenu]}>
          {(['light', 'dark', 'vibrant', 'minimalist'] as MapTheme[]).map(theme => (
            <TouchableOpacity
              key={theme}
              onPress={() => {
                setMapTheme(theme)
                setShowThemeMenu(false)
              }}
              style={[
                styles.menuItem,
                mapTheme === theme && styles.menuItemActive,
                mapTheme === 'dark' && styles.darkMenuItem,
              ]}
            >
              <Text style={[styles.menuItemText, mapTheme === theme && styles.menuItemTextActive]}>
                {theme === 'light' && '☀️ Light'}
                {theme === 'dark' && '🌙 Dark'}
                {theme === 'vibrant' && '🌈 Vibrant'}
                {theme === 'minimalist' && '◻️ Minimalist'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Route Menu */}
      {showRouteMenu && (
        <View style={[styles.menu, mapTheme === 'dark' && styles.darkMenu]}>
          {(['none', 'all', 'selected'] as RouteMode[]).map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => {
                setRouteMode(mode)
                setShowRouteMenu(false)
              }}
              style={[
                styles.menuItem,
                routeMode === mode && styles.menuItemActive,
                mapTheme === 'dark' && styles.darkMenuItem,
              ]}
            >
              <Text style={[styles.menuItemText, routeMode === mode && styles.menuItemTextActive]}>
                {mode === 'none' && 'None'}
                {mode === 'all' && '🔀 All Venues'}
                {mode === 'selected' && '→ Selected Only'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Map View */}
      {viewMode === 'map' ? (
        <ScrollView contentContainerStyle={styles.mapContainer}>
          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity
              onPress={handleZoomIn}
              style={[styles.zoomButton, styles.zoomInButton]}
            >
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <View style={styles.zoomLevel}>
              <Text style={styles.zoomLevelText}>Z:{zoomLevel}</Text>
            </View>
            <TouchableOpacity
              onPress={handleZoomOut}
              style={[styles.zoomButton, styles.zoomOutButton]}
            >
              <Text style={styles.zoomButtonText}>−</Text>
            </TouchableOpacity>
          </View>

          {/* Map Image */}
          {userLocation && (
            <View style={styles.mapWrapper}>
              <Image
                source={{ uri: generateMapEmbedUrl() }}
                style={styles.mapImage}
                onError={(e) => console.log('Map image error:', e.nativeEvent.error)}
              />
              
              {/* Feature Indicators */}
              <View style={styles.featureIndicators}>
                <View style={styles.indicator}>
                  <Text style={styles.indicatorEmoji}>🔵</Text>
                  <Text style={styles.indicatorText}>5-mile Radius</Text>
                </View>
                <View style={styles.indicator}>
                  <Text style={styles.indicatorEmoji}>→</Text>
                  <Text style={styles.indicatorText}>{routeMode === 'none' ? 'No Routes' : routeMode === 'all' ? 'All Routes' : 'Route'}</Text>
                </View>
                <View style={styles.indicator}>
                  <Text style={styles.indicatorEmoji}>🎨</Text>
                  <Text style={styles.indicatorText}>{mapTheme}</Text>
                </View>
              </View>

              {/* Legend */}
              <View style={[styles.legend, mapTheme === 'dark' && styles.darkLegend]}>
                <View style={styles.legendHeader}>
                  <Text style={[styles.legendTitle, mapTheme === 'dark' && styles.darkLegendTitle]}>
                    🍽️ Venues ({filteredAndSortedVenues.length})
                  </Text>
                </View>
                <View style={styles.legendMarkerGuide}>
                  <View style={styles.guideItem}>
                    <View style={[styles.guideMarker, { backgroundColor: '#3b82f6' }]}>
                      <Text style={styles.guideMarkerText}>YOU</Text>
                    </View>
                    <Text style={[styles.guideLabel, mapTheme === 'dark' && styles.darkGuideLabel]}>Your Location</Text>
                  </View>
                  <View style={styles.guideItem}>
                    <View style={[styles.guideMarker, { backgroundColor: '#dc2626' }]}>
                      <Text style={styles.guideMarkerText}>1</Text>
                    </View>
                    <Text style={[styles.guideLabel, mapTheme === 'dark' && styles.darkGuideLabel]}>Venues</Text>
                  </View>
                </View>
                
                {hasVenues ? (
                  <FlatList
                    data={filteredAndSortedVenues}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedVenue(item.id)
                          setViewMode('list')
                        }}
                        style={[styles.legendItem, mapTheme === 'dark' && styles.darkLegendItem]}
                      >
                        <View style={styles.legendMarker}>
                          <Text style={styles.legendNumber}>{index + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.legendName, mapTheme === 'dark' && styles.darkLegendName]} numberOfLines={1}>
                            {getVenueEmoji(item.type)} {item.name}
                          </Text>
                          <Text style={[styles.legendDistance, mapTheme === 'dark' && styles.darkLegendDistance]}>
                            {item.distance?.toFixed(1)} mi • ⭐ {item.rating?.toFixed(1) || 'N/A'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text style={[styles.noVenuesText, mapTheme === 'dark' && styles.darkNoVenuesText]}>
                    No venues found within {SEARCH_RADIUS_MILES} miles
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <>
          {/* Error Message */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Search Bar */}
          <View style={[styles.searchContainer, mapTheme === 'dark' && styles.darkSearchContainer]}>
            <TextInput
              placeholder="Search venues..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
              style={[styles.searchInput, mapTheme === 'dark' && styles.darkSearchInput]}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort Options */}
          <View style={[styles.sortContainer, mapTheme === 'dark' && styles.darkSortContainer]}>
            <TouchableOpacity
              onPress={() => setSortBy('distance')}
              style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === 'distance' && styles.sortButtonTextActive,
                ]}
              >
                📍 Distance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortBy('rating')}
              style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === 'rating' && styles.sortButtonTextActive,
                ]}
              >
                ⭐ Rating
              </Text>
            </TouchableOpacity>
          </View>

          {/* Venues List */}
          <FlatList
            data={filteredAndSortedVenues}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity
                  onPress={() => handleVenuePress(item.id)}
                  style={[styles.venueCard, mapTheme === 'dark' && styles.darkVenueCard]}
                  activeOpacity={0.7}
                >
                  <View style={styles.venueHeader}>
                    <View style={styles.venueInfo}>
                      <View style={styles.venueNameRow}>
                        <Text style={styles.venueEmoji}>{getVenueEmoji(item.type)}</Text>
                        <View style={styles.venueNameCol}>
                          <Text style={[styles.venueName, mapTheme === 'dark' && styles.darkVenueName]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View style={styles.venueMetaRow}>
                            <Text style={styles.venueType}>{item.type.toUpperCase()}</Text>
                            <Text style={styles.venueSeparator}>•</Text>
                            <Text style={[styles.venueDistance, mapTheme === 'dark' && styles.darkVenueDistance]}>
                              📍 {item.distance?.toFixed(1)} mi
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    {item.rating ? (
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
                        <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={[styles.venueAddress, mapTheme === 'dark' && styles.darkVenueAddress]} numberOfLines={2}>
                    {item.address}
                  </Text>

                  {item.openNow !== undefined ? (
                    <View
                      style={[
                        styles.openStatusBadge,
                        { backgroundColor: item.openNow ? '#dcfce7' : '#fee2e2' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.openStatusText,
                          { color: item.openNow ? '#166534' : '#991b1b' },
                        ]}
                      >
                        {item.openNow ? '🟢 Open Now' : '🔴 Closed'}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.expandIcon}>
                    <Text>{selectedVenue === item.id ? '▼' : '▶'}</Text>
                  </View>
                </TouchableOpacity>

                {selectedVenue === item.id ? (
                  <View style={[styles.expandedDetails, mapTheme === 'dark' && styles.darkExpandedDetails]}>
                    <View style={styles.detailsSection}>
                      {item.rating ? (
                        <View style={styles.detailRow}>
                          <Text style={[styles.detailLabel, mapTheme === 'dark' && styles.darkDetailLabel]}>Rating:</Text>
                          <Text style={styles.detailValue}>
                            {'⭐'.repeat(Math.floor(item.rating))}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, mapTheme === 'dark' && styles.darkDetailLabel]}>Distance:</Text>
                        <Text style={[styles.detailValue, mapTheme === 'dark' && styles.darkDetailValue]}>
                          {item.distance?.toFixed(2)} miles
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, mapTheme === 'dark' && styles.darkDetailLabel]}>Type:</Text>
                        <Text style={[styles.detailValue, mapTheme === 'dark' && styles.darkDetailValue]}>
                          {item.type}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity
                        onPress={() => handleViewDetails(item)}
                        style={styles.actionButton}
                      >
                        <Text style={styles.actionButtonText}>View Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.checkInButton]}
                        onPress={() => Alert.alert('Check In', `Checked in at ${item.name}`)}
                      >
                        <Text style={styles.checkInButtonText}>📍 Check In</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            )}
            contentContainerStyle={styles.venuesList}
            refreshing={loading}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🔍</Text>
                <Text style={[styles.emptyStateText, mapTheme === 'dark' && styles.darkEmptyStateText]}>
                  No venues found
                </Text>
                <Text style={[styles.emptyStateSubtext, mapTheme === 'dark' && styles.darkEmptyStateSubtext]}>
                  {searchQuery ? 'Try adjusting your search' : `No venues within ${SEARCH_RADIUS_MILES} miles`}
                </Text>
              </View>
            }
          />
        </>
      )}

      {/* Venue Count Footer */}
      <View style={[styles.countFooter, mapTheme === 'dark' && styles.darkCountFooter]}>
        <Text style={[styles.countText, mapTheme === 'dark' && styles.darkCountText]}>
          Showing {filteredAndSortedVenues.length} of {venues.length} venues
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingSubtext2: {
    marginTop: 4,
    fontSize: 12,
    color: '#9ca3af',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  darkHeader: {
    backgroundColor: '#2d2d2d',
    borderBottomColor: '#444',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  darkTitle: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  darkSubtitle: {
    color: '#b0b0b0',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  refreshButtonText: {
    fontSize: 18,
  },
  locationBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ede9fe',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd6fe',
  },
  darkLocationBanner: {
    backgroundColor: '#3d2d5c',
    borderBottomColor: '#5d4d7c',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6d28d9',
  },
  darkLocationText: {
    color: '#d0b4ff',
  },
  radiusText: {
    fontSize: 11,
    color: '#7c3aed',
    marginTop: 4,
    fontWeight: '500',
  },
  darkRadiusText: {
    color: '#c0a4ff',
  },
  controlPanel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  darkControlPanel: {
    backgroundColor: '#2d2d2d',
    borderBottomColor: '#444',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#7c3aed',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  featureControls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  featureButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  darkFeatureButton: {
    backgroundColor: '#5d3acd',
  },
  featureButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  menu: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    gap: 4,
  },
  darkMenu: {
    backgroundColor: '#3d3d3d',
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  darkMenuItem: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  menuItemActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  darkMenuItemText: {
    color: '#ffffff',
  },
  menuItemTextActive: {
    color: '#fff',
  },
  mapContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mapWrapper: {
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  mapImage: {
    width: width - 24,
    height: 400,
    backgroundColor: '#e5e7eb',
  },
  featureIndicators: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    justifyContent: 'space-around',
  },
  indicator: {
    alignItems: 'center',
    gap: 2,
  },
  indicatorEmoji: {
    fontSize: 16,
  },
  indicatorText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  zoomControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    gap: 8,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  zoomInButton: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  zoomOutButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  zoomLevel: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  zoomLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  legend: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  darkLegend: {
    backgroundColor: '#2d2d2d',
    borderTopColor: '#444',
  },
  legendHeader: {
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  darkLegendTitle: {
    color: '#ffffff',
  },
  legendMarkerGuide: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideMarkerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
  },
  guideLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  darkGuideLabel: {
    color: '#b0b0b0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  darkLegendItem: {
    borderBottomColor: '#444',
  },
  legendMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendNumber: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  darkLegendName: {
    color: '#ffffff',
  },
  legendDistance: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  darkLegendDistance: {
    color: '#b0b0b0',
  },
  noVenuesText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },
  darkNoVenuesText: {
    color: '#808080',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  darkSearchContainer: {
    backgroundColor: '#2d2d2d',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  darkSearchInput: {
    borderColor: '#444',
    backgroundColor: '#3d3d3d',
    color: '#ffffff',
  },
  clearButton: {
    marginLeft: 8,
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  darkSortContainer: {
    backgroundColor: '#2d2d2d',
    borderBottomColor: '#444',
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#7c3aed',
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  venuesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  venueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  darkVenueCard: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  venueInfo: {
    flex: 1,
  },
  venueNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueEmoji: {
    fontSize: 24,
  },
  venueNameCol: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  darkVenueName: {
    color: '#ffffff',
  },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  venueSeparator: {
    color: '#d1d5db',
  },
  venueDistance: {
    fontSize: 12,
    color: '#6b7280',
  },
  darkVenueDistance: {
    color: '#b0b0b0',
  },
  ratingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  reviewCountText: {
    fontSize: 11,
    color: '#b45309',
  },
  venueAddress: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  darkVenueAddress: {
    color: '#b0b0b0',
  },
  openStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  openStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    alignItems: 'center',
    padding: 4,
  },
  expandedDetails: {
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 12,
    marginHorizontal: -12,
    marginBottom: -12,
    marginTop: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  darkExpandedDetails: {
    backgroundColor: '#3d3d3d',
    borderTopColor: '#555',
  },
  detailsSection: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  darkDetailLabel: {
    color: '#b0b0b0',
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  darkDetailValue: {
    color: '#ffffff',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  checkInButton: {
    backgroundColor: '#7c3aed',
  },
  checkInButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  darkEmptyStateText: {
    color: '#ffffff',
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  darkEmptyStateSubtext: {
    color: '#b0b0b0',
  },
  countFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  darkCountFooter: {
    backgroundColor: '#2d2d2d',
    borderTopColor: '#444',
  },
  countText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  darkCountText: {
    color: '#b0b0b0',
  },
})
