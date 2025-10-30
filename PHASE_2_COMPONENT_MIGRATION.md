# PHASE 2: COMPONENT MIGRATION - Club App Frontend

**Status:** Starting Implementation  
**Phase Duration:** Weeks 3-5  
**Priority:** High  
**Commits:** Will create 5-10 feature commits  

---

## OVERVIEW

Phase 2 focuses on integrating authentication checks, updating core components to use the new API client and Zustand auth store, and migrating the most critical features first.

### Goals
- ✅ Add authentication check on app initialization
- ✅ Update AuthScreen to use new auth store
- ✅ Migrate core API-dependent components
- ✅ Test all major user flows
- ✅ Ensure zero Supabase references

---

## PRIORITY BREAKDOWN

### Priority 1 (CRITICAL) - Days 1-3
These must be completed first as they unblock other work:

1. **App Root Component Update** - Add auth check on mount
2. **Login/Signup Screen** - Use new auth store
3. **Protected Routes** - Redirect to login if no auth

### Priority 2 (HIGH) - Days 4-7
High-value components used in main workflows:

4. **Dashboard Layout** - Add navigation with logout
5. **Profile Screen** - Update to use new API
6. **Orders List** - Fetch from NestJS API
7. **Scan Screen** - QR code scanning with API

### Priority 3 (MEDIUM) - Days 8-14
Support components that don't block main flows:

8. **Settings Screen** - User preferences
9. **Help Screen** - Static content/support
10. **Navigation** - Improved UX

---

## DETAILED IMPLEMENTATION GUIDE

### STEP 1: Root Layout - Add Auth Provider (Day 1)

**File:** `/web/app/layout.tsx`

Current issue: No auth provider or session management

**What to do:**
```typescript
// OLD: Basic layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}

// NEW: Add auth initialization
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function RootLayout({ children }) {
  // Initialize auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await useAuthStore.getState().loadUser()
      } catch (error) {
        console.error('Auth initialization failed:', error)
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
      </head>
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
```

**Checklist:**
- [ ] Import useAuthStore
- [ ] Add useEffect for initialization
- [ ] Call loadUser() on mount
- [ ] Handle errors gracefully
- [ ] Test in browser (check console)

---

### STEP 2: Login Page - Use New Auth Store (Day 1-2)

**File:** `/web/app/(auth)/login/page.tsx`

**Before:**
```typescript
// OLD: Supabase implementation
import { createClient } from '@supabase/supabase-js'

export default function LoginPage() {
  const handleLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }
}
```

**After:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/utils/error-handler'
import { toast } from 'sonner' // or use a simple alert

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login(email, password)
      // ✅ Automatically redirects after successful login
      router.push('/dashboard')
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('Login failed:', message)
      // Error is stored in state and displayed
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Desh</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>No account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a></p>
        </div>
      </div>
    </div>
  )
}
```

**Checklist:**
- [ ] Remove all Supabase imports
- [ ] Use useAuthStore hook
- [ ] Display error messages
- [ ] Handle loading states
- [ ] Redirect on success
- [ ] Test with backend

---

### STEP 3: Protected Routes Middleware (Day 2)

**File:** `/web/app/(dashboard)/layout.tsx`

**New implementation:**
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      <main className="p-4">{children}</main>
    </div>
  )
}

function DashboardNavigation() {
  const { logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Desh</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
```

**Checklist:**
- [ ] Check authentication on load
- [ ] Redirect if not authenticated
- [ ] Show loading state
- [ ] Add logout button
- [ ] Test redirect flow

---

### STEP 4: Dashboard Main Page (Day 3)

**File:** `/web/app/(dashboard)/page.tsx`

**Implementation:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/utils/api-client'
import { getErrorMessage } from '@/utils/error-handler'

interface DashboardStats {
  totalOrders: number
  pendingRedemptions: number
  activeUsers: number
  lastUpdated: string
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Call your NestJS endpoint
        const data = await apiClient.get('/dashboard/stats')
        setStats(data)
        setError(null)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Welcome back, {user?.displayName || user?.email}!</h2>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            color="blue"
          />
          <StatCard
            title="Pending Redemptions"
            value={stats.pendingRedemptions}
            color="yellow"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            color="green"
          />
        </div>
      ) : null}
    </div>
  )
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: 'blue' | 'yellow' | 'green'
}) {
  const bgColor = {
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    green: 'bg-green-50',
  }[color]

  const textColor = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
  }[color]

  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className={`${textColor} text-3xl font-bold`}>{value}</p>
    </div>
  )
}
```

**Checklist:**
- [ ] Import useAuthStore
- [ ] Display user info
- [ ] Fetch stats using apiClient
- [ ] Show loading state
- [ ] Handle errors
- [ ] Test API integration

---

### STEP 5: Orders List (Day 4)

**File:** `/web/app/(dashboard)/orders/page.tsx`

**Implementation:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/utils/api-client'
import { getErrorMessage } from '@/utils/error-handler'

interface Order {
  id: string
  orderId: string
  userEmail: string
  items: string[]
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
  completedAt?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await apiClient.get('/orders', {
          params: { status: filter === 'all' ? undefined : filter }
        })
        setOrders(data)
        setError(null)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [filter])

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Orders</h2>

      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No orders found</div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const statusColor = {
    pending: 'bg-yellow-50 text-yellow-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  }[order.status]

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{order.orderId}</p>
          <p className="text-sm text-gray-600">{order.userEmail}</p>
          <p className="text-sm text-gray-500 mt-1">{order.items.join(', ')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
          {order.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Created: {new Date(order.createdAt).toLocaleString()}
      </p>
    </div>
  )
}
```

**Checklist:**
- [ ] Fetch orders from NestJS API
- [ ] Filter by status
- [ ] Display order list
- [ ] Show loading/error states
- [ ] Format dates properly

---

### STEP 6: Scan Screen (Day 5)

**File:** `/web/app/(dashboard)/scan/page.tsx`

**Implementation:**
```typescript
'use client'

import { useRef, useEffect, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { apiClient } from '@/utils/api-client'
import { getErrorMessage } from '@/utils/error-handler'

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(true)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!scanning || !videoRef.current) return

    const reader = new BrowserMultiFormatReader()
    const handleResult = async (result: any) => {
      const code = result.getText()
      if (code && code !== scannedCode) {
        setScannedCode(code)
        await processQRCode(code)
      }
    }

    const decodeFromVideoElement = async () => {
      try {
        await reader.decodeFromVideoElement(videoRef.current, handleResult)
      } catch (err) {
        if (err instanceof Error && !err.message.includes('Not found')) {
          console.error('Scanner error:', err)
        }
      }
    }

    decodeFromVideoElement()

    return () => {
      reader.reset()
    }
  }, [scanning, scannedCode])

  const processQRCode = async (code: string) => {
    try {
      setProcessing(true)
      setError(null)
      setSuccess(null)

      // Call your NestJS redemption endpoint
      const result = await apiClient.post('/redemptions/scan', {
        qrCode: code,
      })

      setSuccess(`✅ Redeemed: ${result.itemName}`)
      setScannedCode(null)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
        setProcessing(false)
      }, 3000)
    } catch (err) {
      setError(getErrorMessage(err))
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Scan QR Code</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <video
          ref={videoRef}
          className="w-full rounded-lg bg-black"
          style={{ maxWidth: '500px', aspectRatio: '1 / 1' }}
        />

        <button
          onClick={() => setScanning(!scanning)}
          className={`mt-4 px-4 py-2 rounded-lg font-semibold ${
            scanning
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {scanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {processing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Processing...</p>
        </div>
      )}

      {scannedCode && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">Last scanned:</p>
          <p className="font-mono text-blue-700 break-all">{scannedCode}</p>
        </div>
      )}
    </div>
  )
}
```

**Checklist:**
- [ ] Setup QR code scanner (@zxing)
- [ ] Capture video stream
- [ ] Process scanned codes
- [ ] Call redemption API
- [ ] Show success/error states
- [ ] Handle permissions

---

### STEP 7: Profile Screen (Day 6)

**File:** `/web/app/(dashboard)/profile/page.tsx`

**Implementation:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/utils/api-client'
import { getErrorMessage } from '@/utils/error-handler'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await apiClient.put('/profile', {
        displayName,
        email,
      })

      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">Profile Settings</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Checklist:**
- [ ] Display user info
- [ ] Allow editing display name
- [ ] Call profile update API
- [ ] Show success/error
- [ ] Disable email editing

---

## TESTING CHECKLIST

### Functional Testing
- [ ] Login flow works end-to-end
- [ ] Protected routes redirect to login
- [ ] Dashboard loads with correct data
- [ ] Orders can be filtered
- [ ] QR scanner captures codes
- [ ] Redemption API works
- [ ] Logout clears session
- [ ] Refresh token works (make 401 test)

### Authentication Testing
- [ ] Invalid credentials show error
- [ ] Valid credentials create session
- [ ] Token stored correctly
- [ ] Token refreshed on 401
- [ ] Logout clears token

### Error Handling
- [ ] Network errors handled
- [ ] API errors displayed
- [ ] 401 triggers refresh
- [ ] Failed refresh redirects to login
- [ ] Timeouts handled gracefully

### UI/UX Testing
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Success messages shown
- [ ] Mobile responsive
- [ ] No console errors

---

## GIT COMMIT STRATEGY

```bash
# Day 1 - Auth Foundation
git commit -m "Phase 2: Step 1-3 - Add auth provider and login flow

- Update root layout.tsx with auth initialization
- Add useEffect to load user on app mount
- Create login page with new auth store
- Add protected dashboard layout
- Implement automatic redirect for unauthenticated users
- Add logout functionality

All authentication flows now using new api-client.ts with direct NestJS integration"

# Day 2-3 - Dashboard
git commit -m "Phase 2: Step 4-5 - Dashboard and orders integration

- Create dashboard main page with stats
- Add orders list with filtering
- Fetch data from NestJS API endpoints
- Add loading and error states
- Display user welcome message
- Format and display order information

Verified all API calls work correctly"

# Day 4-6 - Scan and Profile
git commit -m "Phase 2: Step 6-7 - QR scanner and profile management

- Implement QR code scanning with @zxing
- Add redemption endpoint integration
- Create profile settings page
- Allow user to update display name
- Add success/error notifications
- Handle scanner permissions and errors

All features tested and working with NestJS backend"
```

---

## COMMON ISSUES & SOLUTIONS

### Issue: "Cannot find module '@/store/authStore'"

**Solution:**
```bash
# Make sure path alias is configured in tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: "Token not being refreshed"

**Solution:**
- Check that `api-client.ts` has interceptor configured
- Verify backend is returning 401 on expired token
- Check error handler is catching 401 correctly

### Issue: "Components not seeing auth state"

**Solution:**
```typescript
// Add 'use client' directive at top of file
'use client'

import { useAuthStore } from '@/store/authStore'
```

### Issue: "QR scanner not working"

**Solution:**
```bash
# Install @zxing packages
npm install @zxing/browser @zxing/library

# Check browser permissions for camera
# Check console for specific error messages
```

### Issue: "API calls failing with CORS errors"

**Solution:**
- Verify backend is running and accessible
- Check `NEXT_PUBLIC_API_URL` in GitHub Secrets
- Ensure apiClient is using correct baseURL
- Backend should have CORS enabled for frontend domain

---

## SUCCESS CRITERIA

✅ **Phase 2 Complete When:**
- All 7 steps implemented
- All components tested
- Zero Supabase references
- All API calls working
- Error handling verified
- Ready for Phase 3 (API integration testing)

---

## NEXT: PHASE 3

After Phase 2 completes, Phase 3 will:
1. Test all API endpoints
2. Handle edge cases
3. Optimize performance
4. Add missing features
5. Prepare for production

---

**Status:** Ready to Begin  
**Difficulty:** Medium  
**Estimated Time:** 5 days  
**Team Size:** 1-2 developers
