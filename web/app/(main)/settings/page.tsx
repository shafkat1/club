'use client'

import { useState } from 'react'
import { Bell, Lock, Eye, Smartphone, HelpCircle } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      messages: true,
      friendRequests: true,
      offers: true,
      checkIns: false,
    },
    privacy: {
      profilePublic: true,
      showOnlineStatus: true,
      allowMessages: true,
    },
    appearance: {
      darkMode: false,
      fontSize: 'medium',
    },
  })

  const handleToggle = (category: string, setting: string) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [setting]: !settings[category as keyof typeof settings][setting as keyof object],
      },
    })
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your preferences and account</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl p-8 space-y-8">
          {/* Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <label className="text-gray-700 font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <button
                    onClick={() => handleToggle('notifications', key)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      value ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Privacy</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <label className="text-gray-700 font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <button
                    onClick={() => handleToggle('privacy', key)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      value ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-6 w-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div className="py-3 border-b border-gray-100">
                <label className="text-gray-700 font-medium">Dark Mode</label>
                <button
                  onClick={() => handleToggle('appearance', 'darkMode')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors mt-2 ${
                    settings.appearance.darkMode ? 'bg-pink-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settings.appearance.darkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="py-3">
                <label className="block text-gray-700 font-medium mb-2">Font Size</label>
                <select
                  value={settings.appearance.fontSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, fontSize: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Account</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 px-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                Change Password
              </button>
              <button className="w-full py-3 px-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                Two-Factor Authentication
              </button>
              <button className="w-full py-3 px-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                Download Your Data
              </button>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Help & Support</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 px-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                Contact Support
              </button>
              <button className="w-full py-3 px-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                Report a Bug
              </button>
              <button className="w-full py-3 px-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                View Help Center
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <h2 className="text-xl font-bold text-red-900 mb-6">Danger Zone</h2>
            <button className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
