'use client'

import { useState } from 'react'
import { Users, Plus, MessageCircle, Settings, MapPin } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { ScrollArea } from '@/app/components/ui/scroll-area'

interface Member {
  userId: string
  name: string
  avatar: string
}

interface Group {
  id: string
  name: string
  members: Member[]
  currentVenue?: {
    name: string
    id: string
  }
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Weekend Crew',
    members: [
      { userId: '1', name: 'Sarah', avatar: '👩‍🦰' },
      { userId: '2', name: 'Mike', avatar: '👨' },
      { userId: '3', name: 'Emma', avatar: '👩' },
      { userId: '4', name: 'James', avatar: '👨‍🦱' },
      { userId: '5', name: 'Lisa', avatar: '👩‍🦱' },
      { userId: '6', name: 'David', avatar: '👨‍🦲' },
    ],
    currentVenue: { name: 'The Tap House', id: 'venue1' },
  },
  {
    id: '2',
    name: 'Tech Meetup',
    members: [
      { userId: '7', name: 'Alex', avatar: '👨‍💼' },
      { userId: '8', name: 'Rachel', avatar: '👩‍🦰' },
      { userId: '9', name: 'Chris', avatar: '👨' },
    ],
  },
  {
    id: '3',
    name: 'Coffee Lovers',
    members: [
      { userId: '10', name: 'Jordan', avatar: '👨‍🦱' },
      { userId: '11', name: 'Casey', avatar: '👩‍💼' },
      { userId: '12', name: 'Morgan', avatar: '👩' },
      { userId: '13', name: 'Taylor', avatar: '👨' },
    ],
  },
]

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(mockGroups)

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Groups
          </h1>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 py-8">
        {groups.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No groups yet</p>
            <p className="text-sm mt-2">Create a group to get started</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                          {group.members.length} members
                        </Badge>
                      </div>

                      {group.currentVenue && (
                        <div className="flex items-center gap-1 mb-3 text-sm text-indigo-600">
                          <MapPin className="w-4 h-4" />
                          <span>At {group.currentVenue.name}</span>
                        </div>
                      )}

                      {/* Member Avatars */}
                      <div className="flex -space-x-3 mb-4">
                        {group.members.slice(0, 5).map((member) => (
                          <Avatar key={member.userId} className="border-2 border-white w-10 h-10 hover:scale-110 transition-transform cursor-pointer">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                        {group.members.length > 5 && (
                          <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700 hover:scale-110 transition-transform cursor-pointer">
                            +{group.members.length - 5}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-purple-50">
                          <Settings className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
