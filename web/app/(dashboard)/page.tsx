'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/utils/api-client'
import { getErrorMessage } from '@/utils/error-handler'

interface Stats {
  totalOrders: number
  redeemedToday: number
  pendingOrders: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📊 Loading dashboard data...')

      // Call the orders API endpoint
      const response = await apiClient.get('/orders')
      const orders = response || []

      console.log(`✅ Loaded ${orders.length} orders`)

      // Calculate stats
      const stats: Stats = {
        totalOrders: orders.length,
        redeemedToday: orders.filter((o: any) => o.status === 'REDEEMED' || o.status === 'completed').length,
        pendingOrders: orders.filter((o: any) => o.status === 'PENDING' || o.status === 'pending').length,
      }

      setStats(stats)
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('❌ Error loading dashboard:', message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.displayName || user?.email || 'Bartender'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium">Error loading dashboard</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? (
                    <span className="inline-block animate-pulse">—</span>
                  ) : (
                    stats?.totalOrders || 0
                  )}
                </p>
              </div>
              <div className="text-4xl">🍹</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Redeemed Today
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {loading ? (
                    <span className="inline-block animate-pulse">—</span>
                  ) : (
                    stats?.redeemedToday || 0
                  )}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {loading ? (
                    <span className="inline-block animate-pulse">—</span>
                  ) : (
                    stats?.pendingOrders || 0
                  )}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        </div>

        {/* Reload Button */}
        {error && (
          <div className="mb-6">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium text-sm"
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/scan"
              className="block bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-6 text-center transition"
            >
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-blue-900">Scan QR Code</h3>
              <p className="text-sm text-blue-700 mt-1">Redeem drinks quickly</p>
            </Link>

            <Link
              href="/dashboard/orders"
              className="block bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-6 text-center transition"
            >
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-purple-900">View Orders</h3>
              <p className="text-sm text-purple-700 mt-1">Manage all orders</p>
            </Link>

            <Link
              href="/dashboard/profile"
              className="block bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-6 text-center transition"
            >
              <div className="text-3xl mb-2">👤</div>
              <h3 className="font-semibold text-green-900">My Profile</h3>
              <p className="text-sm text-green-700 mt-1">Edit your details</p>
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
          <p className="text-blue-800 text-sm">
            Keep the QR scanner ready! When a customer shows their drink confirmation, scan the QR code to instantly redeem it. No manual entry needed.
          </p>
        </div>
      </div>
    </div>
  )
}
