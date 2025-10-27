import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  drinkPreference?: string;
  isInterestedInDrink: boolean;
}

// Mock group members data
const MOCK_GROUP_MEMBERS: User[] = [
  {
    id: 'user_001',
    name: 'Alice Cooper',
    phone: '+1 (555) 001-0001',
    avatar: undefined,
    drinkPreference: 'Margarita',
    isInterestedInDrink: true,
  },
  {
    id: 'user_002',
    name: 'Bob Smith',
    phone: '+1 (555) 002-0002',
    avatar: undefined,
    drinkPreference: 'Beer',
    isInterestedInDrink: true,
  },
  {
    id: 'user_003',
    name: 'Carol White',
    phone: '+1 (555) 003-0003',
    avatar: undefined,
    drinkPreference: 'Mojito',
    isInterestedInDrink: false,
  },
  {
    id: 'user_004',
    name: 'David Johnson',
    phone: '+1 (555) 004-0004',
    avatar: undefined,
    drinkPreference: 'Whiskey',
    isInterestedInDrink: true,
  },
  {
    id: 'user_005',
    name: 'Emma Davis',
    phone: '+1 (555) 005-0005',
    avatar: undefined,
    drinkPreference: 'Cosmopolitan',
    isInterestedInDrink: true,
  },
];

export default function BuyDrinkScreen() {
  const [users, setUsers] = useState<User[]>(MOCK_GROUP_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentGroup = { id: 'group_1', name: 'Friday Night Squad' };

  useEffect(() => {
    // Simulate initial loading
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBuyDrink = (user: User) => {
    try {
      Alert.alert(
        '🍻 Buy a Drink',
        `Buy ${user.drinkPreference || 'a drink'} for ${user.name}?`,
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: () => {
              Alert.alert('Success!', `You bought ${user.drinkPreference || 'a drink'} for ${user.name}!`);
            },
            style: 'default',
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to initiate purchase');
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    // Safe name extraction
    const userInitial = item.name && item.name.length > 0
      ? item.name.charAt(0).toUpperCase()
      : '?';

    return (
      <View style={styles.userCard}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        ) : (
          <View style={[styles.userAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{userInitial}</Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
          <Text style={styles.userPhone}>{item.phone || 'N/A'}</Text>
          {item.drinkPreference && (
            <Text style={styles.drinkPreference}>🍺 {item.drinkPreference}</Text>
          )}
          {item.isInterestedInDrink && (
            <View style={styles.interestBadge}>
              <Text style={styles.interestText}>Interested in a drink</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => handleBuyDrink(item)}
        >
          <Text style={styles.buyButtonText}>💳 Buy</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍻 Buy a Drink</Text>
        <Text style={styles.subtitle}>{currentGroup?.name || 'Select Group'}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {users.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyEmoji}>🍷</Text>
          <Text style={styles.emptyText}>No members available</Text>
          <Text style={styles.emptySubtext}>Invite friends to buy them a drink</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 500);
          }}
          ListHeaderComponent={
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{users.length}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{users.filter(u => u.isInterestedInDrink).length}</Text>
                <Text style={styles.statLabel}>Interested</Text>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  drinkPreference: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
    marginBottom: 4,
  },
  interestBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  interestText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  buyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
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
