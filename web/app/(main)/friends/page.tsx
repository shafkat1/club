'use client'

import { useState } from 'react'
import { UserPlus, MessageCircle, MoreVertical, Check, X } from 'lucide-react'

interface Friend {
  id: string
  name: string
  status: 'friend' | 'pending' | 'requested'
  avatar: string
  mutualFriends: number
}

const mockFriends: Friend[] = [
  { id: '1', name: 'Sarah Johnson', status: 'friend', avatar: '👩', mutualFriends: 5 },
  { id: '2', name: 'Michael Chen', status: 'friend', avatar: '👨', mutualFriends: 3 },
  { id: '3', name: 'Emma Wilson', status: 'pending', avatar: '👩‍🦰', mutualFriends: 2 },
  { id: '4', name: 'James Brown', status: 'requested', avatar: '👨‍💼', mutualFriends: 1 },
  { id: '5', name: 'Olivia Davis', status: 'friend', avatar: '👩‍🔬', mutualFriends: 7 },
]

export default function FriendsPage() {
  const [friends, setFriends] = useState(mockFriends)
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends')

  const handleAccept = (id: string) => {
    setFriends(
      friends.map((f) =>
        f.id === id ? { ...f, status: 'friend' as const } : f,
      ),
    )
  }

  const handleReject = (id: string) => {
    setFriends(friends.filter((f) => f.id !== id))
  }

  const friendsList = friends.filter((f) => f.status === 'friend')
  const requestsList = friends.filter((f) => f.status === 'requested')

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
        <p className="text-gray-600 mt-1">Manage your friends and connections</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('friends')}
            className={`py-4 px-2 font-semibold transition-all ${
              activeTab === 'friends'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Friends {friendsList.length > 0 && `(${friendsList.length})`}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-2 font-semibold transition-all ${
              activeTab === 'requests'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Requests {requestsList.length > 0 && `(${requestsList.length})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'friends' ? (
          <div className="p-8">
            {friendsList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">👋 No friends yet</p>
                <p className="text-gray-400 mt-2">Discover and connect with people!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-2xl">
                        {friend.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                        <p className="text-sm text-gray-600">{friend.mutualFriends} mutual friends</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-indigo-50 rounded-lg transition">
                        <MessageCircle className="h-5 w-5 text-indigo-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8">
            {requestsList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">📭 No friend requests</p>
                <p className="text-gray-400 mt-2">You're all caught up!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {requestsList.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-2xl">
                        {request.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.name}</h3>
                        <p className="text-sm text-gray-600">{request.mutualFriends} mutual friends</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
