'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    // Redirect to login if not authenticated
    // Disabled for UI testing mode - backend not running
    // if (!isLoading && !isAuthenticated) {
    //   console.log('⚠️ Not authenticated, redirecting to login...')
    //   router.push('/login')
    // }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...')
      await logout()
      console.log('✅ Logged out successfully')
      router.push('/login')
    } catch (error) {
      console.error('❌ Logout failed:', error)
    }
  }

  // Show loading state while checking authentication
  // Disabled for UI testing mode
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
  //         <p className="text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Don't render dashboard if not authenticated
  // Disabled for UI testing mode
  // if (!isAuthenticated) {
  //   return null // Will redirect via useEffect
  // }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/scan', label: 'QR Scanner', icon: '📱' },
    { href: '/dashboard/orders', label: 'Orders', icon: '📋' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white border-r border-gray-200 fixed md:static top-0 left-0 h-full z-40 transition-all`}
      >
        <div className="p-6 h-full overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-blue-600">Desh</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium text-sm"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 pt-6 mt-auto">
            {user && (
              <div className="flex items-center gap-3 mb-4 px-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName || user.email || 'Bartender'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
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
        <div className="flex-1 overflow-auto">
          {children}
        </div>
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
