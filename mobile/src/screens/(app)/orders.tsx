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
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MOCK_ORDERS } from '@/lib/mockData'

type OrderStatus = 'all' | 'pending' | 'accepted' | 'redeemed'

const { width } = Dimensions.get('window')

export default function OrdersScreen() {
  const router = useRouter()
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [filter, setFilter] = useState<OrderStatus>('all')
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  const handleAcceptOrder = (orderId: string) => {
    setOrders(
      orders.map(o =>
        o.id === orderId ? { ...o, status: 'accepted' as const } : o
      )
    )
    Alert.alert('Success', 'Order accepted!')
  }

  const handleDeclineOrder = (orderId: string) => {
    Alert.alert('Decline Order', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Decline',
        onPress: () => {
          setOrders(
            orders.map(o =>
              o.id === orderId ? { ...o, status: 'declined' as const } : o
            )
          )
        },
      },
    ])
  }

  const handleRedeemOrder = (orderId: string) => {
    Alert.alert('Redeem Order', 'Show this QR code to the bartender', [
      { text: 'OK', onPress: () => {
        setOrders(
          orders.map(o =>
            o.id === orderId ? { ...o, status: 'redeemed' as const } : o
          )
        )
      }}
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e', icon: '⏳' }
      case 'accepted':
        return { bg: '#dbeafe', text: '#1e40af', icon: '✓' }
      case 'redeemed':
        return { bg: '#d1fae5', text: '#065f46', icon: '✅' }
      default:
        return { bg: '#f3f4f6', text: '#6b7280', icon: '○' }
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffMs = expires.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins <= 0) return 'Expired'
    if (diffMins < 60) return `${diffMins} min left`
    const hours = Math.floor(diffMins / 60)
    return `${hours}h left`
  }

  const orderStats = {
    pending: orders.filter(o => o.status === 'pending').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    redeemed: orders.filter(o => o.status === 'redeemed').length,
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🍻 My Orders</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>{orderStats.pending}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Accepted</Text>
          <Text style={styles.statValue}>{orderStats.accepted}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Redeemed</Text>
          <Text style={styles.statValue}>{orderStats.redeemed}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'accepted', 'redeemed'] as OrderStatus[]).map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => setFilter(status)}
            style={[styles.filterTab, filter === status && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === status && styles.filterTabTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedOrder === item.id
          const statusColor = getStatusColor(item.status)
          const isBuyer = item.buyerId === 'current_user'

          return (
            <View key={item.id}>
              {/* Order Card */}
              <TouchableOpacity
                onPress={() => setSelectedOrder(isSelected ? null : item.id)}
                style={styles.orderCard}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderEmoji}>{isBuyer ? '🎁' : '🎉'}</Text>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle}>
                        {isBuyer ? `Sent to ${item.recipientName}` : `From ${item.buyerName}`}
                      </Text>
                      <Text style={styles.orderVenue}>📍 {item.venueName}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                      {statusColor.icon} {item.status}
                    </Text>
                  </View>
                </View>

                {/* Amount and Time */}
                <View style={styles.orderFooter}>
                  <Text style={styles.amount}>${item.totalAmount.toFixed(2)}</Text>
                  <Text style={styles.timeRemaining}>{getTimeRemaining(item.expiresAt)}</Text>
                </View>
              </TouchableOpacity>

              {/* Expanded Details */}
              {isSelected && (
                <View style={styles.orderDetailsContainer}>
                  {/* Items */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Items</Text>
                    {item.items.map((itemName, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemName}>🍷 {itemName}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Order Details */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Details</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>From:</Text>
                      <Text style={styles.detailValue}>{item.buyerName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>To:</Text>
                      <Text style={styles.detailValue}>{item.recipientName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Venue:</Text>
                      <Text style={styles.detailValue}>{item.venueName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total:</Text>
                      <Text style={[styles.detailValue, styles.amountText]}>
                        ${item.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Timeline */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Timeline</Text>
                    <View style={styles.timelineItem}>
                      <View style={styles.timelineMarker}>
                        <Text style={styles.timelineMarkerText}>📅</Text>
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineLabel}>Created</Text>
                        <Text style={styles.timelineTime}>
                          {new Date(item.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.timelineItem}>
                      <View style={styles.timelineMarker}>
                        <Text style={styles.timelineMarkerText}>⏰</Text>
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineLabel}>Expires</Text>
                        <Text style={styles.timelineTime}>
                          {new Date(item.expiresAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsContainer}>
                    {item.status === 'pending' && !isBuyer && (
                      <>
                        <TouchableOpacity
                          onPress={() => handleAcceptOrder(item.id)}
                          style={[styles.actionButton, styles.acceptButton]}
                        >
                          <Text style={styles.acceptButtonText}>✓ Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeclineOrder(item.id)}
                          style={[styles.actionButton, styles.declineButton]}
                        >
                          <Text style={styles.declineButtonText}>✕ Decline</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {item.status === 'accepted' && (
                      <TouchableOpacity
                        onPress={() => handleRedeemOrder(item.id)}
                        style={[styles.actionButton, styles.redeemButton]}
                      >
                        <Text style={styles.redeemButtonText}>📱 Show QR Code</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === 'redeemed' && (
                      <View style={[styles.actionButton, styles.completedButton]}>
                        <Text style={styles.completedButtonText}>✅ Completed</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🍻</Text>
            <Text style={styles.emptyStateText}>No orders</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'all'
                ? 'Create or receive drink orders with your friends'
                : `No ${filter} orders yet`}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Create Order Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/map')}
      >
        <Text style={styles.floatingButtonText}>+ Send Order</Text>
      </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#dbeafe',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#1e40af',
  },
  listContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  orderEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  orderVenue: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  timeRemaining: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderDetailsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  detailSection: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  itemRow: {
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 13,
    color: '#6b7280',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  detailValue: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    textAlign: 'right',
  },
  amountText: {
    fontWeight: '700',
    color: '#111827',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timelineMarkerText: {
    fontSize: 12,
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  actionsContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#d1fae5',
  },
  acceptButtonText: {
    color: '#065f46',
    fontWeight: '600',
    fontSize: 13,
  },
  declineButton: {
    backgroundColor: '#fee2e2',
  },
  declineButtonText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 13,
  },
  redeemButton: {
    backgroundColor: '#dbeafe',
  },
  redeemButtonText: {
    color: '#1e40af',
    fontWeight: '600',
    fontSize: 13,
  },
  completedButton: {
    backgroundColor: '#d1fae5',
  },
  completedButtonText: {
    color: '#065f46',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    left: 16,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
})
