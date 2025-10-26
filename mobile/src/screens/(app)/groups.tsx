import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MOCK_GROUPS, MOCK_VENUES } from '@/lib/mockData'

export default function GroupsScreen() {
  const router = useRouter()
  const [groups, setGroups] = useState(MOCK_GROUPS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name')
      return
    }

    const newGroup = {
      id: `g${Date.now()}`,
      name: groupName,
      memberCount: 1,
      members: [
        { id: 'u0', name: 'You', avatar: '👤' },
      ],
      currentVenue: undefined,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setGroups([...groups, newGroup])
    setGroupName('')
    setShowCreateModal(false)
    Alert.alert('Success', 'Group created successfully!')
  }

  const handleDeleteGroup = (groupId: string) => {
    Alert.alert('Delete Group', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => {
          setGroups(groups.filter(g => g.id !== groupId))
          if (selectedGroup === groupId) {
            setSelectedGroup(null)
          }
        },
      },
    ])
  }

  const handleViewGroup = (groupId: string) => {
    setSelectedGroup(selectedGroup === groupId ? null : groupId)
  }

  const currentGroup = groups.find(g => g.id === selectedGroup)
  const currentVenue = currentGroup?.currentVenue
    ? MOCK_VENUES.find(v => v.id === currentGroup.currentVenue)
    : null

  const groupEmojis = ['🎉', '🍻', '🎵', '🕺', '🌟', '🎊', '🎈', '🎆']

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👫 My Groups</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      {/* Groups List */}
      <FlatList
        data={filteredGroups}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => {
          const isSelected = selectedGroup === item.id
          return (
            <View key={item.id}>
              {/* Group Card */}
              <TouchableOpacity
                onPress={() => handleViewGroup(item.id)}
                style={[styles.groupCard, isSelected && styles.groupCardSelected]}
              >
                <Text style={styles.groupEmoji}>
                  {groupEmojis[index % groupEmojis.length]}
                </Text>
                <View style={styles.groupCardContent}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupMembersCount}>
                    {item.memberCount} members
                  </Text>
                  {item.currentVenue && (
                    <Text style={styles.groupVenue}>
                      📍 At {MOCK_VENUES.find(v => v.id === item.currentVenue)?.name}
                    </Text>
                  )}
                </View>
                <Text style={styles.expandIcon}>{isSelected ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {/* Expanded Details */}
              {isSelected && (
                <View style={styles.groupDetails}>
                  {/* Members */}
                  <View style={styles.membersSection}>
                    <Text style={styles.detailTitle}>Members</Text>
                    <View style={styles.membersList}>
                      {item.members.map((member, idx) => (
                        <View key={member.id} style={styles.memberItem}>
                          <Text style={styles.memberAvatar}>{member.avatar}</Text>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>
                              {member.name} {idx === 0 ? '(owner)' : ''}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Current Venue */}
                  {currentVenue && (
                    <View style={styles.venueSection}>
                      <Text style={styles.detailTitle}>Current Location</Text>
                      <View style={styles.venueCard}>
                        <Text style={styles.venueEmoji}>🍺</Text>
                        <View style={styles.venueCardContent}>
                          <Text style={styles.venueName}>{currentVenue.name}</Text>
                          <Text style={styles.venueType}>{currentVenue.type}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.actionsSection}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>👥 Add Member</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>📍 Change Venue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteGroup(item.id)}
                      style={[styles.actionButton, styles.deleteButton]}
                    >
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                        🗑️ Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>👥</Text>
            <Text style={styles.emptyStateText}>No groups yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create a group to invite friends and buy drinks together
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={styles.emptyStateButton}
            >
              <Text style={styles.emptyStateButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Group</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                placeholder="e.g., Weekend Warriors"
                value={groupName}
                onChangeText={setGroupName}
                placeholderTextColor="#d1d5db"
                style={styles.modalInput}
                maxLength={50}
              />
              <Text style={styles.characterCount}>
                {groupName.length}/50 characters
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateGroup}
                  style={[styles.modalButton, styles.createGroupButton]}
                >
                  <Text style={styles.createGroupButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  listContainer: {
    padding: 16,
    gap: 12,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  groupEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  groupCardContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  groupMembersCount: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  groupVenue: {
    fontSize: 11,
    color: '#3b82f6',
  },
  expandIcon: {
    fontSize: 12,
    color: '#9ca3af',
  },
  groupDetails: {
    marginLeft: 44,
    marginRight: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
  },
  membersSection: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
  },
  memberAvatar: {
    fontSize: 18,
    marginRight: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  venueSection: {
    marginBottom: 12,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
  },
  venueEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  venueCardContent: {
    flex: 1,
  },
  venueName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  venueType: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  actionsSection: {
    gap: 6,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  emptyStateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  modalInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 14,
    color: '#111827',
    marginBottom: 6,
  },
  characterCount: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  createGroupButton: {
    backgroundColor: '#3b82f6',
  },
  createGroupButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
})
