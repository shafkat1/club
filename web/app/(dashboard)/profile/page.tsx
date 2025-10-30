'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/utils/api-client'
import { getErrorMessage } from '@/utils/error-handler'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      setError('Display name is required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('💾 Updating profile...')
      
      const response = await apiClient.put('/profile', {
        displayName: formData.displayName.trim(),
      })

      console.log('✅ Profile updated successfully')
      setSuccess('Profile updated successfully!')
      setEditing(false)

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('❌ Error updating profile:', message)
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...')
      await logout()
      console.log('✅ Logged out successfully')
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
      // Force redirect even if logout fails
      router.push('/login')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl mb-4">
              👤
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.displayName || user.email || 'Bartender'}
            </h2>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Display Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your display name"
                  disabled={saving}
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                  {user.displayName || 'Not set'}
                </p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg flex justify-between items-center">
                <span>{user.email}</span>
                <span className="text-green-600 text-sm font-medium">✓ Verified</span>
              </p>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Created
              </label>
              <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-8 border-t border-gray-200">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      displayName: user?.displayName || '',
                      email: user?.email || '',
                    })
                    setError(null)
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  🚪 Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Info</h3>
          <p className="text-sm text-blue-800">
            Your email address is your unique identifier and cannot be changed. For security questions, contact support@desh.co.
          </p>
        </div>
      </div>
    </div>
  )
}
