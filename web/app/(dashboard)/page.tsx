'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ordersAPI, venuesAPI } from '@/lib/api'
import { getUser } from '@/lib/auth'

interface Stats {
  totalOrders: number
  redeemedToday: number
  pendingOrders: number
}

interface User {
  displayName?: string
  phone?: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userData = await getUser()
      setUser(userData)

      const response = await ordersAPI.list()
      const orders = response.data

      setStats({
        totalOrders: orders.length,
        redeemedToday: orders.filter((o: any) => o.status === 'REDEEMED').length,
        pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.displayName || 'Bartender'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">{user?.phone}</p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? '—' : stats?.totalOrders || 0}
                </p>
              </div>
              <div className="text-4xl">🍹</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Redeemed Today
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {loading ? '—' : stats?.redeemedToday || 0}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {loading ? '—' : stats?.pendingOrders || 0}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/scan"
              className="block bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-6 text-center transition"
            >
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-blue-900">Scan QR Code</h3>
              <p className="text-sm text-blue-700 mt-1">Redeem drinks quickly</p>
            </Link>

            <Link
              href="/orders"
              className="block bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-6 text-center transition"
            >
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-purple-900">View Orders</h3>
              <p className="text-sm text-purple-700 mt-1">Manage all orders</p>
            </Link>

            <Link
              href="/profile"
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
