'use client'

import { useState } from 'react'
import { Heart, MessageCircle, X, Info } from 'lucide-react'

interface User {
  id: string
  name: string
  age: number
  location: string
  bio: string
  image: string
  interests: string[]
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 24,
    location: 'San Francisco',
    bio: 'Wine enthusiast & travel lover 🍷✈️',
    image: '👩',
    interests: ['Wine', 'Travel', 'Music'],
  },
  {
    id: '2',
    name: 'Alex',
    age: 26,
    location: 'Oakland',
    bio: 'Craft beer expert & foodie 🍺🍽️',
    image: '👨',
    interests: ['Beer', 'Food', 'Hiking'],
  },
  {
    id: '3',
    name: 'Emma',
    age: 23,
    location: 'San Francisco',
    bio: 'Cocktail mixer & DJ 🎧🍹',
    image: '👩‍🦰',
    interests: ['Cocktails', 'Music', 'Dancing'],
  },
  {
    id: '4',
    name: 'James',
    age: 28,
    location: 'Berkeley',
    bio: 'Whiskey connoisseur 🥃',
    image: '👨‍💼',
    interests: ['Whiskey', 'Sports', 'Gaming'],
  },
]

export default function DiscoverPage() {
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [likedUsers, setLikedUsers] = useState<string[]>([])

  const currentUser = mockUsers[currentUserIndex]

  const handleLike = () => {
    setLikedUsers([...likedUsers, currentUser.id])
    nextUser()
  }

  const handlePass = () => {
    nextUser()
  }

  const nextUser = () => {
    if (currentUserIndex < mockUsers.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1)
    }
  }

  if (currentUserIndex >= mockUsers.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">No more users!</h1>
          <p className="text-gray-600 mb-6">You've checked out all available users for now. Come back later for more!</p>
          <button
            onClick={() => {
              setCurrentUserIndex(0)
              setLikedUsers([])
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
        <p className="text-gray-600 mt-1">Find and connect with people who love drinks</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* User Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Image/Avatar */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-80 flex items-center justify-center text-9xl">
              {currentUser.image}
            </div>

            {/* User Info */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentUser.name}, {currentUser.age}
                </h2>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  📍 {currentUser.location}
                </p>
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-4 leading-relaxed">{currentUser.bio}</p>

              {/* Interests */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">12</p>
                  <p className="text-xs text-gray-600 mt-1">Mutual Friends</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">5</p>
                  <p className="text-xs text-gray-600 mt-1">Shared Venues</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">3</p>
                  <p className="text-xs text-gray-600 mt-1">Shared Interests</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePass}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                  Pass
                </button>
                <button
                  onClick={handleLike}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  <Heart className="h-5 w-5" />
                  Like
                </button>
              </div>

              {/* Message Button */}
              <button className="w-full mt-3 flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-2 px-4 rounded-lg transition">
                <MessageCircle className="h-5 w-5" />
                Message
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {currentUserIndex + 1} of {mockUsers.length} users
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentUserIndex + 1) / mockUsers.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
