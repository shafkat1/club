'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Map,
  Users,
  UserCircle,
  UsersRound,
  Gift,
  MessageCircle,
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

interface NavItem {
  id: string
  icon: React.ReactNode
  label: string
  href: string
  badge?: number
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const navItems: NavItem[] = [
    { id: 'map', icon: <Map className="h-5 w-5" />, label: 'Map', href: '/app/map' },
    { id: 'discover', icon: <Users className="h-5 w-5" />, label: 'Discover', href: '/app/discover' },
    { id: 'friends', icon: <UserCircle className="h-5 w-5" />, label: 'Friends', href: '/app/friends' },
    { id: 'groups', icon: <UsersRound className="h-5 w-5" />, label: 'Groups', href: '/app/groups' },
    { id: 'offers', icon: <Gift className="h-5 w-5" />, label: 'Offers', href: '/app/offers' },
    { id: 'messages', icon: <MessageCircle className="h-5 w-5" />, label: 'Messages', href: '/app/messages' },
    { id: 'profile', icon: <User className="h-5 w-5" />, label: 'Profile', href: '/app/profile' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/login')
    }
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="sticky top-0 h-screen w-64 p-5 border-r border-gray-200 bg-white/80 backdrop-blur-xl flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          TreatMe
        </h1>
        <p className="text-xs text-gray-500 mt-1">Connect over drinks</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700'
              }`}
            >
              <span className={active ? 'text-white' : 'text-gray-600'}>{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span
                  className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Settings */}
      <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
        <Link
          href="/app/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive('/app/settings')
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className={`h-5 w-5 ${isActive('/app/settings') ? 'text-white' : 'text-gray-600'}`} />
          <span className="font-medium text-sm">Settings</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </nav>
  )
}
