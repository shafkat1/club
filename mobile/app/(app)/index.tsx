import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { getUser, clearAuth } from '@/lib/auth'

interface User {
  displayName?: string
  phone?: string
}

export default function HomeScreen() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'groups' | 'profile'>('map')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await getUser()
      setUser(userData)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const handleLogout = async () => {
    await clearAuth()
    router.replace('/login')
  }

  const navigateTo = (screen: string) => {
    setActiveTab(screen as any)
    router.push(`/(app)/${screen}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {user?.displayName || 'Friend'} 👋</Text>
          <Text style={styles.subtext}>{user?.phone}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => navigateTo('map')}
          style={[styles.tab, activeTab === 'map' && styles.tabActive]}
        >
          <Text style={styles.tabIcon}>🗺️</Text>
          <Text style={[styles.tabLabel, activeTab === 'map' && styles.tabLabelActive]}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigateTo('groups')}
          style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
        >
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={[styles.tabLabel, activeTab === 'groups' && styles.tabLabelActive]}>
            Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigateTo('profile')}
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start 🚀</Text>
          <TouchableOpacity onPress={() => navigateTo('map')} style={styles.card}>
            <Text style={styles.cardIcon}>🗺️</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Find Venues</Text>
              <Text style={styles.cardDescription}>
                Discover nearby bars & clubs with people looking to buy/receive drinks
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateTo('groups')} style={styles.card}>
            <Text style={styles.cardIcon}>👥</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Manage Groups</Text>
              <Text style={styles.cardDescription}>
                Create groups with friends and see who's at each venue together
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateTo('profile')} style={styles.card}>
            <Text style={styles.cardIcon}>👤</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Your Profile</Text>
              <Text style={styles.cardDescription}>
                Update your profile, view friend requests, and manage preferences
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works 💡</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Set your role (Buyer or Receiver)</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Check into a venue on the map</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Browse people & send drinks</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Bartender scans QR to redeem</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💬 Got Questions?</Text>
            <Text style={styles.infoText}>
              Visit our help center or contact support at support@desh.co
            </Text>
          </View>
        </View>
      </ScrollView>
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
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3b82f6',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  steps: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
})
