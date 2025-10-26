'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, clearAuth, setUser } from '@/lib/auth'

interface User {
  id: string
  phone?: string
  email?: string
  displayName?: string
  profileImage?: string
  phoneVerified: boolean
  emailVerified: boolean
  createdAt: Date
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const userData = await getUser()
      if (!userData) {
        router.push('/login')
        return
      }
      setUserState(userData)
      setFormData({
        displayName: userData.displayName || '',
        email: userData.email || '',
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      // In a real app, you'd make an API call to update the profile
      // const response = await userAPI.updateProfile(formData);
      
      // For now, just update local storage
      if (user) {
        const updatedUser = {
          ...user,
          displayName: formData.displayName,
          email: formData.email,
        }
        await setUser(updatedUser)
        setUserState(updatedUser)
        setMessage('Profile updated successfully!')
        setEditing(false)
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
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
          <p className="text-gray-600 mt-4">Loading profile...</p>
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
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {message && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              message.includes('successfully')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl mb-4">
              👤
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || 'Bartender'}</h2>
            <p className="text-gray-600 mt-1">{user?.phone}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Name Field */}
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
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                  {user?.displayName || 'Not set'}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg flex justify-between items-center">
                <span>{user?.phone}</span>
                <span className="text-green-600 text-sm font-medium">✓ Verified</span>
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                  {user?.email || 'Not set'}
                </p>
              )}
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Created
              </label>
              <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                {new Date(user?.createdAt || '').toLocaleDateString()}
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
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
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-gray-600 text-sm mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button className="bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-medium py-2 px-4 rounded-lg transition">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
