import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList, Image } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

interface User {
  id: string
  displayName: string
  profileImage?: string
  role: 'buyer' | 'receiver'
}

export default function VenueDetailsScreen() {
  const router = useRouter()
  const { venueId } = useLocalSearchParams()
  const [venue, setVenue] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<'all' | 'buyer' | 'receiver'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVenueData()
  }, [venueId])

  const loadVenueData = async () => {
    setLoading(true)
    try {
      // Mock venue data
      setVenue({
        id: venueId,
        name: 'The Club House',
        address: '123 Main St, New York',
        phone: '+1 (555) 123-4567',
        image: '🍹',
      })

      // Mock users at venue
      const mockUsers: User[] = [
        { id: '1', displayName: 'Sarah', role: 'receiver' },
        { id: '2', displayName: 'John', role: 'buyer' },
        { id: '3', displayName: 'Emma', role: 'receiver' },
        { id: '4', displayName: 'Mike', role: 'buyer' },
        { id: '5', displayName: 'Lisa', role: 'receiver' },
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error loading venue:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true
    return user.role === filter
  })

  const handleBuyDrink = (user: User) => {
    router.push({
      pathname: '/buy-drink',
      params: { userId: user.id, venueId, userName: user.displayName },
    })
  }

  const handleUserProfile = (user: User) => {
    router.push({
      pathname: '/user-profile',
      params: { userId: user.id },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{venue?.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Venue Card */}
          <View style={styles.venueCard}>
            <View style={styles.venueImage}>
              <Text style={styles.venueImageText}>{venue?.image}</Text>
            </View>
            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{venue?.name}</Text>
              <Text style={styles.venueAddress}>{venue?.address}</Text>
              <Text style={styles.venuePhone}>{venue?.phone}</Text>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              onPress={() => setFilter('all')}
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                All ({users.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('buyer')}
              style={[styles.filterButton, filter === 'buyer' && styles.filterButtonActive]}
            >
              <Text style={[styles.filterButtonText, filter === 'buyer' && styles.filterButtonTextActive]}>
                Buying ({users.filter((u) => u.role === 'buyer').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('receiver')}
              style={[styles.filterButton, filter === 'receiver' && styles.filterButtonActive]}
            >
              <Text style={[styles.filterButtonText, filter === 'receiver' && styles.filterButtonTextActive]}>
                Receiving ({users.filter((u) => u.role === 'receiver').length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Users Grid */}
          <View style={styles.usersGrid}>
            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <TouchableOpacity
                  onPress={() => handleUserProfile(user)}
                  style={styles.userCardHeader}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>👤</Text>
                  </View>
                  <Text style={styles.userName}>{user.displayName}</Text>
                </TouchableOpacity>

                <View style={styles.userRole}>
                  <Text style={[styles.roleText, user.role === 'buyer' ? styles.roleBuyer : styles.roleReceiver]}>
                    {user.role === 'buyer' ? '💰 Buying' : '🍹 Receiving'}
                  </Text>
                </View>

                {user.role === 'receiver' && (
                  <TouchableOpacity
                    onPress={() => handleBuyDrink(user)}
                    style={styles.buyButton}
                  >
                    <Text style={styles.buyButtonText}>Send Drink 🎁</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No {filter === 'all' ? 'people' : filter} found</Text>
            </View>
          )}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#3b82f6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  venueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  venueImage: {
    height: 120,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueImageText: {
    fontSize: 48,
  },
  venueInfo: {
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  venuePhone: {
    fontSize: 13,
    color: '#3b82f6',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  userCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userCardHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatarText: {
    fontSize: 24,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  userRole: {
    marginBottom: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roleBuyer: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  roleReceiver: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  buyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
})
