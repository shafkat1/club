'use client'

import { Users, LogOut } from 'lucide-react'

const groups = [
  { id: '1', name: 'Weekend Runners', members: 42, joined: true },
  { id: '2', name: 'Happy Hour Crew', members: 156, joined: true },
  { id: '3', name: 'Coffee Lovers Club', members: 89, joined: false },
  { id: '4', name: 'Night Owls', members: 203, joined: false },
]

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <p className="text-sm text-gray-600 mt-1">Join communities and meet people</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6">
          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center text-white">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.members} members</p>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg transition font-medium text-sm flex items-center gap-2 ${
                    group.joined
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  }`}
                >
                  {group.joined ? (
                    <>
                      <LogOut size={16} />
                      Leave
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      Join
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
