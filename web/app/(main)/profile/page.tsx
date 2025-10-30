'use client'

import { useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    age: 26,
    location: 'San Francisco, CA',
    bio: 'Craft beer enthusiast 🍺 | Love exploring new venues | Weekend adventure seeker',
    interests: ['Beer', 'Travel', 'Hiking', 'Food', 'Music'],
    image: '👨',
  })

  const [formData, setFormData] = useState(profile)

  const handleEdit = () => {
    setEditing(true)
    setFormData(profile)
  }

  const handleSave = () => {
    setProfile(formData)
    setEditing(false)
  }

  const handleCancel = () => {
    setFormData(profile)
    setEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your profile information</p>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Edit2 className="h-5 w-5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-2xl">
          {/* Avatar */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-7xl mb-4">
              {profile.image}
            </div>
            {editing && (
              <div className="mt-4">
                <input
                  type="text"
                  value={formData.image}
                  onChange={handleInputChange}
                  name="image"
                  placeholder="Emoji"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-gray-900 text-lg">{profile.name}</p>
              )}
            </div>

            {/* Age and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                {editing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{profile.age}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                {editing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{profile.location}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              {editing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  rows={4}
                />
              ) : (
                <p className="text-gray-700">{profile.bio}</p>
              )}
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">42</p>
                <p className="text-sm text-gray-600 mt-1">Friends</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">18</p>
                <p className="text-sm text-gray-600 mt-1">Groups</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">5</p>
                <p className="text-sm text-gray-600 mt-1">Offers Sent</p>
              </div>
            </div>

            {/* Buttons */}
            {editing && (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  <Save className="h-5 w-5" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
