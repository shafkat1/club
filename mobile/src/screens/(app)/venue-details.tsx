import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { MOCK_VENUES, MOCK_GROUPS } from '@/lib/mockData'

interface Review {
  id: string
  author: string
  rating: number
  comment: string
  date: string
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Alex M.',
    rating: 5,
    comment: 'Amazing vibes and great service! The cocktails are top-notch.',
    date: '2 days ago',
  },
  {
    id: '2',
    author: 'Jordan K.',
    rating: 4,
    comment: 'Fun place, music was loud but thats what we came for!',
    date: '1 week ago',
  },
  {
    id: '3',
    author: 'Casey L.',
    rating: 5,
    comment: 'Perfect spot for a night out. Will definitely come back.',
    date: '2 weeks ago',
  },
]

export default function VenueDetailsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const venueId = params.venueId as string

  const venue = MOCK_VENUES.find(v => v.id === venueId)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  if (!venue) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Venue not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handleCheckIn = () => {
    if (selectedGroup) {
      Alert.alert('Success', `Checked in with ${selectedGroup}`)
      setIsCheckedIn(true)
    } else {
      Alert.alert('Select a Group', 'Please select a group to check in with')
    }
  }

  const handleSendOrder = () => {
    router.push({
      pathname: '/create-order',
      params: { venueId: venue.id, venueName: venue.name },
    })
  }

  const groupEmojis = ['🎉', '🍻', '🎵', '🕺']

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Venue Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Venue Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroImage}>
            <Text style={styles.heroEmoji}>🍺</Text>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <View style={styles.venueType}>
              <Text style={styles.venueTypeText}>{venue.type.toUpperCase()}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingBadge}>⭐ {venue.rating}</Text>
              <Text style={styles.reviewCount}>({venue.reviewCount} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Key Info Cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>📍 Distance</Text>
            <Text style={styles.infoValue}>{venue.distance.toFixed(1)} km</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>⏰ Open Now</Text>
            <Text style={styles.infoValue}>{venue.hours.open}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>🎯 Popular</Text>
            <Text style={styles.infoValue}>{venue.buyersCount + venue.receiversCount}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{venue.description}</Text>
        </View>

        {/* Address & Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location & Hours</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{venue.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hours:</Text>
            <Text style={styles.detailValue}>
              {venue.hours.open} - {venue.hours.close}
            </Text>
          </View>
        </View>

        {/* Live Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Live Activity</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityCard}>
              <Text style={styles.activityNumber}>{venue.buyersCount}</Text>
              <Text style={styles.activityLabel}>Looking to Buy</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityNumber}>{venue.receiversCount}</Text>
              <Text style={styles.activityLabel}>Looking to Receive</Text>
            </View>
          </View>
        </View>

        {/* Group Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👫 Check In With Group</Text>
          <FlatList
            data={MOCK_GROUPS}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setSelectedGroup(item.id)}
                style={[
                  styles.groupCard,
                  selectedGroup === item.id && styles.groupCardSelected,
                ]}
              >
                <Text style={styles.groupEmoji}>{groupEmojis[index % groupEmojis.length]}</Text>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupMembers}>
                    {item.memberCount} members
                  </Text>
                </View>
                <View style={styles.checkmark}>
                  {selectedGroup === item.id && (
                    <Text style={styles.checkmarkText}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Reviews</Text>
          {MOCK_REVIEWS.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.author}</Text>
                <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={handleCheckIn}
            style={[
              styles.actionButton,
              styles.checkInButtonStyle,
              isCheckedIn && styles.actionButtonDisabled,
            ]}
            disabled={isCheckedIn}
          >
            <Text style={styles.actionButtonText}>
              {isCheckedIn ? '✓ Checked In' : '📍 Check In'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSendOrder}
            style={[styles.actionButton, styles.orderButtonStyle]}
          >
            <Text style={styles.actionButtonText}>🍻 Send Order</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 80,
  },
  heroContent: {
    gap: 8,
  },
  venueName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  venueType: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  venueTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f59e0b',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  activityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activityNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  activityLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  groupCardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  groupEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  groupMembers: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonStyle: {
    backgroundColor: '#3b82f6',
  },
  orderButtonStyle: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
})
