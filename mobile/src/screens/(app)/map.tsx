import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, SafeAreaView, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { MOCK_VENUES } from '@/lib/mockData'

type VenueType = 'all' | 'bar' | 'club' | 'pub' | 'lounge'

export default function MapScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<VenueType>('all')
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'popularity'>('distance')

  const filteredVenues = useMemo(() => {
    let venues = MOCK_VENUES

    // Filter by search query
    if (searchQuery.trim()) {
      venues = venues.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      venues = venues.filter(v => v.type === selectedType)
    }

    // Sort
    switch (sortBy) {
      case 'distance':
        return venues.sort((a, b) => a.distance - b.distance)
      case 'rating':
        return venues.sort((a, b) => b.rating - a.rating)
      case 'popularity':
        return venues.sort((a, b) => (b.buyersCount + b.receiversCount) - (a.buyersCount + a.receiversCount))
    }
  }, [searchQuery, selectedType, sortBy])

  const handleVenuePress = (venueId: string) => {
    router.push({
      pathname: '/venue-details',
      params: { venueId },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Venues Near You</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search venues..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['all', 'bar', 'club', 'pub', 'lounge'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type as VenueType)}
            style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {['distance', 'rating', 'popularity'].map(sort => (
          <TouchableOpacity
            key={sort}
            onPress={() => setSortBy(sort as any)}
            style={[styles.sortButton, sortBy === sort && styles.sortButtonActive]}
          >
            <Text style={[styles.sortButtonText, sortBy === sort && styles.sortButtonTextActive]}>
              {sort === 'distance' ? '📍' : sort === 'rating' ? '⭐' : '👥'} {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Venues List */}
      <FlatList
        data={filteredVenues}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleVenuePress(item.id)}
            style={styles.venueCard}
            activeOpacity={0.7}
          >
            {/* Venue Header */}
            <View style={styles.venueHeader}>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{item.name}</Text>
                <View style={styles.venueMetaRow}>
                  <Text style={styles.venueType}>{item.type.toUpperCase()}</Text>
                  <Text style={styles.venueDistance}>📍 {item.distance.toFixed(1)} km</Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {item.rating}</Text>
              </View>
            </View>

            {/* Venue Description */}
            <Text style={styles.venueDescription} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Hours */}
            <Text style={styles.venueHours}>
              ⏰ {item.hours.open} - {item.hours.close}
            </Text>

            {/* Live Counts */}
            <View style={styles.countsContainer}>
              <View style={styles.countItem}>
                <Text style={styles.countLabel}>Looking to Buy</Text>
                <Text style={styles.countValue}>{item.buyersCount}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.countItem}>
                <Text style={styles.countLabel}>Looking to Receive</Text>
                <Text style={styles.countValue}>{item.receiversCount}</Text>
              </View>
            </View>

            {/* Check-in Button */}
            <TouchableOpacity style={styles.checkInButton}>
              <Text style={styles.checkInButtonText}>Check In 📍</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.venuesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No venues found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    fontSize: 14,
    color: '#111827',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  sortButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  sortButtonTextActive: {
    color: '#1e40af',
  },
  venuesList: {
    padding: 16,
    gap: 12,
  },
  venueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  venueMetaRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  venueType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  venueDistance: {
    fontSize: 12,
    color: '#6b7280',
  },
  ratingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  venueDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  venueHours: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  countsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  countItem: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  countValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  divider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  checkInButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#6b7280',
  },
})
