'use client'

import { useEffect } from 'react'
import type { Metadata } from 'next'
import { useAuthStore } from '@/store/authStore'
import './globals.css'

// Note: Metadata cannot be used in 'use client' components
// If you need metadata, create a separate server component for it

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...')
        await useAuthStore.getState().loadUser()
        console.log('✅ Authentication initialized successfully')
      } catch (error) {
        console.error('❌ Auth initialization failed:', error)
        // User will be redirected to login by protected routes
      }
    }

    initializeAuth()
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Desh - Bartender Portal</title>
        <meta name="description" content="QR code scanner and drink redemption management for bartenders" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
