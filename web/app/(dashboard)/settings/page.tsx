'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Settings {
  notifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  privacy: 'public' | 'private' | 'friends-only';
  dataCollection: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    language: 'en',
    theme: 'light',
    privacy: 'friends-only',
    dataCollection: false,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/users/settings');
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/users/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your preferences and app configuration</p>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Notifications Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Push Notifications
                  </label>
                  <p className="text-sm text-gray-600">Receive notifications on your device</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-600">Receive email updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Display Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Display</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={settings.privacy}
                  onChange={(e) => handleChange('privacy', e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="friends-only">Friends Only</option>
                  <option value="private">Private (Hidden)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Data Collection
                  </label>
                  <p className="text-sm text-gray-600">Allow usage analytics</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dataCollection}
                  onChange={(e) => handleChange('dataCollection', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-8 flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✓ Settings saved successfully!
          </div>
        )}

        {/* Additional Links */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Options</h3>
          <div className="space-y-3">
            <a href="/help" className="block text-blue-600 hover:underline">
              → Help & Support
            </a>
            <a href="/privacy" className="block text-blue-600 hover:underline">
              → Privacy Policy
            </a>
            <a href="/terms" className="block text-blue-600 hover:underline">
              → Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
