import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import axios from 'axios';

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

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<DrinkNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    // Setup real-time subscription if available
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s as fallback
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/drinks');
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (notification: DrinkNotification) => {
    try {
      await axios.post(`/api/drink-orders/${notification.id}/accept`);
      Alert.alert('Accepted!', `${notification.senderName} will buy you a ${notification.drinkType || 'drink'}!`);
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, status: 'accepted' } : n
      ));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to accept');
    }
  };

  const handleDecline = async (notification: DrinkNotification) => {
    try {
      await axios.post(`/api/drink-orders/${notification.id}/decline`);
      Alert.alert('Declined', `Notification dismissed`);
      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to decline');
    }
  };

  const renderNotification = ({ item }: { item: DrinkNotification }) => {
    const timeAgo = getTimeAgo(new Date(item.createdAt));
    
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
              {item.senderName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.senderName}>{item.senderName}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>

          <Text style={styles.message}>{item.message}</Text>
          
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
        <Text style={styles.title}>Notifications</Text>
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
          onRefresh={fetchNotifications}
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
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  notificationCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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
    borderColor: '#e5e5e5',
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
    color: '#000',
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
