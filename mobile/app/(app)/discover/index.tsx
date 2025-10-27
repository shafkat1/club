import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, TextInput, Image, Alert } from 'react-native';
import axios from 'axios';
import { useGroupStore } from '../../../store/groupStore';

interface DiscoverUser {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isFriend: boolean;
  isInGroup: boolean;
}

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentGroup } = useGroupStore();

  const searchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/users/search?q=${searchQuery}&groupId=${currentGroup?.id}`);
      setFilteredUsers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      searchUsers();
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, searchUsers]);

  const handleAddFriend = async (user: DiscoverUser) => {
    try {
      await axios.post(`/api/friends/${user.id}/add`);
      Alert.alert('Success', `${user.name} added as friend!`);
      // Update local state
      setFilteredUsers(filteredUsers.map(u => 
        u.id === user.id ? { ...u, isFriend: true } : u
      ));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add friend');
    }
  };

  const handleInviteToGroup = async (user: DiscoverUser) => {
    if (!currentGroup) {
      Alert.alert('Error', 'Please select a group first');
      return;
    }

    try {
      await axios.post(`/api/groups/${currentGroup.id}/invite`, { userId: user.id });
      Alert.alert('Success', `${user.name} invited to ${currentGroup.name}!`);
      setFilteredUsers(filteredUsers.map(u => 
        u.id === user.id ? { ...u, isInGroup: true } : u
      ));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to invite user');
    }
  };

  const renderUserItem = ({ item }: { item: DiscoverUser }) => (
    <View style={styles.userCard}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
        <View style={styles.badgeContainer}>
          {item.isFriend && (
            <View style={[styles.badge, styles.friendBadge]}>
              <Text style={styles.badgeText}>👥 Friend</Text>
            </View>
          )}
          {item.isInGroup && (
            <View style={[styles.badge, styles.groupBadge]}>
              <Text style={styles.badgeText}>🎯 In Group</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {!item.isFriend && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleAddFriend(item)}
          >
            <Text style={styles.actionBtnText}>Add</Text>
          </TouchableOpacity>
        )}
        {item.isFriend && !item.isInGroup && currentGroup && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.inviteBtn]}
            onPress={() => handleInviteToGroup(item)}
          >
            <Text style={styles.actionBtnText}>Invite</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {filteredUsers.length === 0 && searchQuery.trim().length > 2 ? (
        <View style={styles.centerContent}>
          {loading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : (
            <Text style={styles.emptyText}>No users found</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={filteredUsers.length > 0}
        />
      )}

      {searchQuery.trim().length === 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.placeholderText}>🔍 Start typing to search</Text>
          <Text style={styles.placeholderSubtext}>Find and connect with friends</Text>
        </View>
      )}
    </SafeAreaView>
  );
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    fontSize: 14,
    color: '#000',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  friendBadge: {
    backgroundColor: '#dcfce7',
  },
  groupBadge: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inviteBtn: {
    backgroundColor: '#8b5cf6',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
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
