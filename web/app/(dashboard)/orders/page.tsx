'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ordersAPI } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

interface Order {
  id: string
  buyerId: string
  recipientId: string
  venueId: string
  amount: number
  currency: string
  status: string
  message?: string
  createdAt: string
  expiresAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'redeemed'>('all')
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrders()
  }, [filter])

  const loadOrders = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await ordersAPI.list(
        filter === 'all' ? undefined : filter.toUpperCase(),
        50
      )
      setOrders(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800'
      case 'REDEEMED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <Link href="/scan" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Scanner
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'accepted', 'redeemed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{order.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${(order.amount / 100).toFixed(2)} {order.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Expires</p>
                    <p className="text-sm text-gray-700">
                      {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {order.message && (
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Message: </span>
                      {order.message}
                    </p>
                  </div>
                )}

                {order.status === 'ACCEPTED' && (
                  <Link
                    href={`/scan?order=${order.id}`}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-center transition"
                  >
                    Generate QR Code
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
