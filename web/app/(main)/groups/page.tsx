'use client'

import { useState } from 'react'
import { Users, Plus, ArrowRight } from 'lucide-react'

interface Group {
  id: string
  name: string
  description: string
  members: number
  image: string
  joined?: boolean
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Wine Lovers',
    description: 'For wine enthusiasts who enjoy tasting and learning',
    members: 342,
    image: '🍷',
    joined: true,
  },
  {
    id: '2',
    name: 'Craft Beer Heads',
    description: 'Discussing and exploring craft beers from around the world',
    members: 567,
    image: '🍺',
    joined: true,
  },
  {
    id: '3',
    name: 'Cocktail Mixers',
    description: 'Sharing cocktail recipes and mixing techniques',
    members: 289,
    image: '🍹',
    joined: false,
  },
  {
    id: '4',
    name: 'Weekend Warriors',
    description: 'For those who love to party and have fun',
    members: 892,
    image: '🎉',
    joined: false,
  },
  {
    id: '5',
    name: 'Foodie & Drinker',
    description: 'Pairing food and drinks for the ultimate experience',
    members: 456,
    image: '🍽️',
    joined: false,
  },
]

export default function GroupsPage() {
  const [groups, setGroups] = useState(mockGroups)

  const handleJoin = (id: string) => {
    setGroups(
      groups.map((g) =>
        g.id === id ? { ...g, joined: true } : g,
      ),
    )
  }

  const handleLeave = (id: string) => {
    setGroups(
      groups.map((g) =>
        g.id === id ? { ...g, joined: false } : g,
      ),
    )
  }

  const joinedGroups = groups.filter((g) => g.joined)
  const availableGroups = groups.filter((g) => !g.joined)

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-600 mt-1">Join groups and connect with communities</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            <Plus className="h-5 w-5" />
            Create Group
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Your Groups */}
        {joinedGroups.length > 0 && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Groups ({joinedGroups.length})</h2>
            <div className="grid gap-4 mb-8">
              {joinedGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-3xl">
                      {group.image}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                      <p className="text-xs text-gray-500 mt-2">👥 {group.members.toLocaleString()} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                      View <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleLeave(group.id)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
                    >
                      Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Groups */}
        {availableGroups.length > 0 && (
          <div className="p-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended For You</h2>
            <div className="grid gap-4">
              {availableGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-3xl">
                      {group.image}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                      <p className="text-xs text-gray-500 mt-2">👥 {group.members.toLocaleString()} members</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoin(group.id)}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition font-medium whitespace-nowrap"
                  >
                    + Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {groups.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-900">No groups yet</h2>
              <p className="text-gray-600 mt-2">Join groups to connect with communities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
