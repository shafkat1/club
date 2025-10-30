'use client'

import { useState } from 'react'
import { Heart, X, MessageCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  age: number
  location: string
  bio: string
  avatar: string
  interests: string[]
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 24,
    location: 'San Francisco',
    bio: 'Love exploring new bars and trying craft cocktails',
    avatar: '👩‍🦰',
    interests: ['Bars', 'Cocktails', 'Music'],
  },
  {
    id: '2',
    name: 'Emma',
    age: 22,
    location: 'SOMA',
    bio: 'Weekend party enthusiast',
    avatar: '👩',
    interests: ['Nightclubs', 'Dancing', 'Friends'],
  },
  {
    id: '3',
    name: 'Jessica',
    age: 25,
    location: 'Mission',
    bio: 'Coffee lover and bookworm',
    avatar: '👩‍🦱',
    interests: ['Cafes', 'Books', 'Art'],
  },
]

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [passedUsers, setPassedUsers] = useState<string[]>([])

  const currentUser = mockUsers[currentIndex]

  const handlePass = () => {
    setPassedUsers([...passedUsers, currentUser.id])
    setCurrentIndex((currentIndex + 1) % mockUsers.length)
  }

  const handleLike = () => {
    console.log('Liked:', currentUser.name)
    setCurrentIndex((currentIndex + 1) % mockUsers.length)
  }

  const handleMessage = () => {
    console.log('Message:', currentUser.name)
  }

  if (!currentUser) {
    return <div>No more users</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <p className="text-sm text-gray-600 mt-1">Find people and make connections</p>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Avatar */}
            <div className="bg-gradient-to-br from-indigo-400 to-purple-400 h-80 flex items-center justify-center text-8xl">
              {currentUser.avatar}
            </div>

            {/* User Info */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentUser.name}, {currentUser.age}
                </h2>
                <p className="text-sm text-gray-600 mt-1">📍 {currentUser.location}</p>
              </div>

              <p className="text-gray-700">{currentUser.bio}</p>

              {/* Interests */}
              <div className="flex gap-2 flex-wrap">
                {currentUser.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 flex gap-4 justify-center">
              <button
                onClick={handlePass}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <X size={20} />
                Pass
              </button>

              <button
                onClick={handleMessage}
                className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Message
              </button>

              <button
                onClick={handleLike}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Heart size={20} />
                Like
              </button>
            </div>
          </div>

          {/* Counter */}
          <p className="text-center text-gray-600 mt-6 text-sm">
            {currentIndex + 1} of {mockUsers.length}
          </p>
        </div>
      </div>
    </div>
  )
}
