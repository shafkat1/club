import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, SafeAreaView } from 'react-native'
// import MapboxGL from '@rnmapbox/maps'
// TODO: Re-add MapboxGL when Mapbox token is configured
import { useLocalSearchParams, useRouter } from 'expo-router'

interface Venue {
  id: string
  name: string
  latitude: number
  longitude: number
  type: string
  buyersCount: number
  receiversCount: number
  distance: number
}

export default function MapScreen() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [mapStyle, setMapStyle] = useState<'light' | 'dark'>('light')
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 })

  useEffect(() => {
    loadVenues()
  }, [userLocation])

  const loadVenues = async () => {
    setLoading(true)
    try {
      // Mock venues data - replace with actual API call
      const mockVenues: Venue[] = [
        {
          id: '1',
          name: 'The Club House',
          latitude: 40.7128,
          longitude: -74.006,
          type: 'nightclub',
          buyersCount: 45,
          receiversCount: 32,
          distance: 0.2,
        },
        {
          id: '2',
          name: 'Rooftop Bar',
          latitude: 40.7138,
          longitude: -74.0096,
          type: 'bar',
          buyersCount: 28,
          receiversCount: 18,
          distance: 0.6,
        },
        {
          id: '3',
          name: 'Lounge 88',
          latitude: 40.7118,
          longitude: -74.0016,
          type: 'lounge',
          buyersCount: 12,
          receiversCount: 9,
          distance: 0.3,
        },
      ]
      setVenues(mockVenues)
    } catch (error) {
      console.error('Error loading venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVenuePress = (venue: Venue) => {
    setSelectedVenue(venue)
  }

  const handleViewVenue = (venue: Venue) => {
    router.push({
      pathname: '/venue-details',
      params: { venueId: venue.id },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Nearby Venues</Text>
        <TouchableOpacity
          onPress={() => setMapStyle(mapStyle === 'light' ? 'dark' : 'light')}
          style={styles.styleButton}
        >
          <Text style={styles.styleButtonText}>{mapStyle === 'light' ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <View style={styles.map}>
          <Text>Map Placeholder</Text>
        </View>
      </View>

      {/* Venues List / Selected Venue Info */}
      {selectedVenue ? (
        <View style={styles.venueDetails}>
          <View style={styles.venueHeader}>
            <View>
              <Text style={styles.venueName}>{selectedVenue.name}</Text>
              <Text style={styles.venueDistance}>{selectedVenue.distance} km away</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedVenue(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.venueCounts}>
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>Looking to buy</Text>
              <Text style={styles.countValue}>{selectedVenue.buyersCount}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>Looking to receive</Text>
              <Text style={styles.countValue}>{selectedVenue.receiversCount}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleViewVenue(selectedVenue)}
            style={styles.viewButton}
          >
            <Text style={styles.viewButtonText}>View & Browse 👥</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {venues.map((venue) => (
            <TouchableOpacity
              key={venue.id}
              onPress={() => handleVenuePress(venue)}
              style={styles.listItem}
            >
              <View style={styles.listItemContent}>
                <Text style={styles.listItemName}>{venue.name}</Text>
                <Text style={styles.listItemDistance}>{venue.distance} km away</Text>
              </View>
              <View style={styles.listItemCount}>
                <View>
                  <Text style={styles.listItemCountValue}>
                    {venue.buyersCount + venue.receiversCount}
                  </Text>
                  <Text style={styles.listItemCountLabel}>people</Text>
                </View>
                <Text style={styles.listItemArrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  styleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleButtonText: {
    fontSize: 20,
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#e5e7eb',
  },
  map: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  markerSelected: {
    backgroundColor: '#1d4ed8',
    borderWidth: 4,
  },
  markerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  venueDetails: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  venueDistance: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  venueCounts: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  countItem: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  countValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  divider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  viewButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemContent: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listItemDistance: {
    fontSize: 13,
    color: '#6b7280',
  },
  listItemCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemCountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
    textAlign: 'right',
  },
  listItemCountLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'right',
  },
  listItemArrow: {
    fontSize: 18,
    color: '#3b82f6',
    marginLeft: 8,
  },
})
