'use client'

import { UserPlus, Check, X } from 'lucide-react'

const friendRequests = [
  { id: '1', name: 'Sarah Johnson', avatar: '👩‍🦰', mutualFriends: 3 },
  { id: '2', name: 'Emma Davis', avatar: '👩', mutualFriends: 5 },
]

const friends = [
  { id: '101', name: 'Alex Smith', avatar: '👨', status: 'online' },
  { id: '102', name: 'Jordan Lee', avatar: '👨‍🦱', status: 'offline' },
  { id: '103', name: 'Casey Taylor', avatar: '👩‍💼', status: 'online' },
]

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your connections</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Friend Requests</h2>
              <div className="space-y-3">
                {friendRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{req.avatar}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{req.name}</h3>
                        <p className="text-sm text-gray-600">{req.mutualFriends} mutual friends</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition">
                        <Check size={20} />
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition">
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Friends ({friends.length})</h2>
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200 hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <span className="text-4xl">{friend.avatar}</span>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{friend.status}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg transition font-medium text-sm">
                    Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
