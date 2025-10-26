import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@/lib/userContext';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
  preferredPayment?: string;
  notificationsEnabled: boolean;
  locationSharing: boolean;
}

export default function ProfileScreen() {
  const { user: contextUser, logout } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a profile from context user
  const user: UserProfile | null = contextUser ? {
    id: contextUser.id || 'demo-user',
    name: contextUser.name || 'Demo User',
    phone: contextUser.phone || '+1 (555) 123-4567',
    email: contextUser.email || 'demo@club.app',
    avatar: contextUser.avatar,
    bio: contextUser.bio || 'Welcome to Club! 🍹',
    joinDate: contextUser.joinDate || new Date().toISOString(),
    preferredPayment: contextUser.preferredPayment || 'Card',
    notificationsEnabled: contextUser.notificationsEnabled !== false,
    locationSharing: contextUser.locationSharing !== false,
  } : null;

  const handleEditProfile = () => {
    router.push('/(app)/profile/edit');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (err) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Unable to load profile</Text>
          <TouchableOpacity 
            style={[styles.actionButton, { marginTop: 16 }]} 
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.actionButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Safe name extraction with null checks
  const nameInitial = (name: string) => {
    if (!name || typeof name !== 'string' || name.length === 0) {
      return 'U';
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>👤 Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {nameInitial(user.name)}
              </Text>
            </View>
          )}

          <Text style={styles.name}>{user.name || 'Demo User'}</Text>
          <Text style={styles.phone}>{user.phone || '+1 (555) 123-4567'}</Text>
          {user.email && <Text style={styles.email}>{user.email}</Text>}
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

          <Text style={styles.joinDate}>
            Joined {new Date(user.joinDate).toLocaleDateString()}
          </Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Account Settings</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                {user.notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}
              </Text>
            </View>
            <View style={[styles.badge, user.notificationsEnabled && styles.badgeActive]}>
              <Text style={styles.badgeText}>
                {user.notificationsEnabled ? '✓' : '✗'}
              </Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Location Sharing</Text>
              <Text style={styles.settingDescription}>
                {user.locationSharing ? '✅ Enabled' : '❌ Disabled'}
              </Text>
            </View>
            <View style={[styles.badge, user.locationSharing && styles.badgeActive]}>
              <Text style={styles.badgeText}>
                {user.locationSharing ? '✓' : '✗'}
              </Text>
            </View>
          </View>

          {user.preferredPayment && (
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>💳 Preferred Payment</Text>
                <Text style={styles.settingDescription}>{user.preferredPayment}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Privacy & Settings feature coming soon!')}>
            <Text style={styles.actionButtonText}>🔒 Privacy & Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Help & Support feature coming soon!')}>
            <Text style={styles.actionButtonText}>❓ Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  profileCard: {
    marginHorizontal: 16,
    marginVertical: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  joinDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 16,
  },
  editButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    color: '#dc2626',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
  },
});
