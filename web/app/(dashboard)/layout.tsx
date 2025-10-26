'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuthToken, getUser, clearAuth } from '@/lib/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = await getAuthToken()
    if (!token) {
      router.push('/login')
      return
    }

    const userData = await getUser()
    setUser(userData)
    setLoading(false)
  }

  const handleLogout = async () => {
    await clearAuth()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/scan', label: 'QR Scanner', icon: '📱' },
    { href: '/orders', label: 'Orders', icon: '📋' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white border-r border-gray-200 fixed md:static top-0 left-0 h-full z-40 transition-all`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-blue-600">Desh</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4 px-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                👤
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName || 'Bartender'}
                </p>
                <p className="text-xs text-gray-500">{user?.phone}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">Desh</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Page Content */}
        {children}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
