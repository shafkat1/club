import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';

interface DrinkNotification {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  drinkType?: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: DrinkNotification[] = [
  {
    id: '1',
    senderId: 'user_123',
    senderName: 'Alex Johnson',
    senderAvatar: undefined,
    drinkType: 'Margarita',
    message: 'Hey! I want to buy you a drink!',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
  },
  {
    id: '2',
    senderId: 'user_456',
    senderName: 'Sarah Williams',
    senderAvatar: undefined,
    drinkType: 'Mojito',
    message: 'Let me get you a drink, friend!',
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min ago
  },
  {
    id: '3',
    senderId: 'user_789',
    senderName: 'Michael Brown',
    senderAvatar: undefined,
    drinkType: 'Beer',
    message: 'Cheers! First round is on me!',
    status: 'accepted',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(), // 1 hour ago
  },
  {
    id: '4',
    senderId: 'user_012',
    senderName: 'Emma Davis',
    senderAvatar: undefined,
    drinkType: 'Cosmopolitan',
    message: 'Want to grab a drink later?',
    status: 'declined',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
  },
  {
    id: '5',
    senderId: 'user_345',
    senderName: 'James Wilson',
    senderAvatar: undefined,
    drinkType: 'Whiskey',
    message: 'My treat! What are you drinking?',
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<DrinkNotification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use mock data - simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = async (notification: DrinkNotification) => {
    try {
      Alert.alert('Accepted!', `${notification.senderName || 'Someone'} will buy you a ${notification.drinkType || 'drink'}!`);
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, status: 'accepted' } : n
      ));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to accept');
    }
  };

  const handleDecline = async (notification: DrinkNotification) => {
    try {
      Alert.alert('Declined', `Notification dismissed`);
      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to decline');
    }
  };

  const renderNotification = ({ item }: { item: DrinkNotification }) => {
    const timeAgo = getTimeAgo(new Date(item.createdAt));
    
    // Safe name extraction
    const senderInitial = item.senderName && item.senderName.length > 0 
      ? item.senderName.charAt(0).toUpperCase() 
      : '?';
    
    return (
      <View style={[
        styles.notificationCard,
        item.status === 'accepted' && styles.acceptedCard,
        item.status === 'declined' && styles.declinedCard
      ]}>
        {item.senderAvatar ? (
          <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {senderInitial}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.headerStyles}>
            <Text style={styles.senderName}>{item.senderName || 'Unknown User'}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>

          <Text style={styles.message}>{item.message || 'No message'}</Text>
          
          {item.drinkType && (
            <View style={styles.drinkBadge}>
              <Text style={styles.drinkText}>🍺 {item.drinkType}</Text>
            </View>
          )}

          {item.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.btn, styles.acceptBtn]}
                onPress={() => handleAccept(item)}
              >
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, styles.declineBtn]}
                onPress={() => handleDecline(item)}
              >
                <Text style={[styles.btnText, styles.declineBtnText]}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'accepted' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Accepted</Text>
            </View>
          )}

          {item.status === 'declined' && (
            <View style={[styles.statusBadge, styles.declinedBadge]}>
              <Text style={[styles.statusText, styles.declinedText]}>✕ Declined</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && !notifications.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Notifications</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyEmoji}>🍻</Text>
          <Text style={styles.emptyText}>No drink offers</Text>
          <Text style={styles.emptySubtext}>Looks like it's a quiet day!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 500);
          }}
          ListHeaderComponent={
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{notifications.filter(n => n.status === 'pending').length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{notifications.filter(n => n.status === 'accepted').length}</Text>
                <Text style={styles.statLabel}>Accepted</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{notifications.filter(n => n.status === 'declined').length}</Text>
                <Text style={styles.statLabel}>Declined</Text>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  notificationCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  acceptedCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  declinedCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  headerStyles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  drinkBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  drinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#10b981',
  },
  declineBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  btnText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#fff',
  },
  declineBtnText: {
    color: '#6b7280',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  declinedBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  declinedText: {
    color: '#991b1b',
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
});
