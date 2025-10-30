'use client'

import { useState } from 'react'
import { Users, UserPlus, UserMinus, Ban, Search, MapPin, Circle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Card, CardContent } from '@/app/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'

interface Friend {
  userId: string
  name: string
  username: string
  avatar: string
  bio?: string
  online: boolean
  currentVenue?: {
    name: string
    id: string
  }
}

interface FriendRequest {
  id: string
  senderName: string
  senderUsername: string
  senderAvatar: string
}

const mockFriends: Friend[] = [
  {
    userId: '1',
    name: 'Sarah Chen',
    username: 'sarahchen',
    avatar: '👩‍🦰',
    bio: 'Foodie & adventure seeker',
    online: true,
    currentVenue: { name: 'The Tap House', id: 'venue1' },
  },
  {
    userId: '2',
    name: 'Mike Johnson',
    username: 'mikej',
    avatar: '👨',
    bio: 'Tech enthusiast',
    online: true,
  },
  {
    userId: '3',
    name: 'Emma Davis',
    username: 'emmad',
    avatar: '👩',
    bio: 'Artist & coffee lover',
    online: false,
  },
]

const mockRequests: FriendRequest[] = [
  {
    id: '1',
    senderName: 'Alex Martinez',
    senderUsername: 'alexmartinez',
    senderAvatar: '👨‍🦲',
  },
  {
    id: '2',
    senderName: 'Jessica Lee',
    senderUsername: 'jessicalee',
    senderAvatar: '👩‍🦱',
  },
]

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [requests, setRequests] = useState<FriendRequest[]>(mockRequests)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [removingFriend, setRemovingFriend] = useState<string | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      // Mock search results
      const results = [
        {
          userId: 'search1',
          name: 'John Smith',
          username: 'johnsmith',
          avatar: '👨‍💼',
          isFriend: false,
        },
        {
          userId: 'search2',
          name: 'Rachel Green',
          username: 'rachelgreen',
          avatar: '👩‍🦰',
          isFriend: false,
        },
      ]
      setSearchResults(results.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())))
    } else {
      setSearchResults([])
    }
  }

  const handleSendFriendRequest = (userId: string) => {
    console.log('Friend request sent to:', userId)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleAcceptRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId)
    if (request) {
      setFriends([
        ...friends,
        {
          userId: request.id,
          name: request.senderName,
          username: request.senderUsername,
          avatar: request.senderAvatar,
          online: false,
        },
      ])
      setRequests(requests.filter((r) => r.id !== requestId))
    }
  }

  const handleRejectRequest = (requestId: string) => {
    setRequests(requests.filter((r) => r.id !== requestId))
  }

  const handleRemoveFriend = (friendId: string) => {
    setFriends(friends.filter((f) => f.userId !== friendId))
    setRemovingFriend(null)
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Friends
          </h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users by name or username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchResults.length > 0 && (
          <Card className="mt-2 absolute z-10 w-[calc(100%-2rem)]">
            <ScrollArea className="max-h-64">
              {searchResults.map((user) => (
                <div key={user.userId} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                  {user.isFriend ? (
                    <Badge variant="secondary">Friends</Badge>
                  ) : (
                    <Button size="sm" onClick={() => handleSendFriendRequest(user.userId)}>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </ScrollArea>
          </Card>
        )}
      </div>

      <Tabs defaultValue="friends" className="flex-1 flex flex-col px-6 py-4">
        <TabsList className="w-fit">
          <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests {requests.length > 0 && `(${requests.length})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="flex-1 mt-4">
          <ScrollArea className="h-full pr-4">
            {friends.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No friends yet</p>
                <p className="text-sm mt-2">Search above to add friends</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <Card key={friend.userId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{friend.name[0]}</AvatarFallback>
                            </Avatar>
                            {friend.online && (
                              <Circle className="w-3 h-3 absolute bottom-0 right-0 fill-emerald-500 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{friend.name}</p>
                            <p className="text-sm text-gray-600">@{friend.username}</p>
                            {friend.bio && <p className="text-sm text-gray-600 mt-1">{friend.bio}</p>}
                            {friend.currentVenue && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-indigo-600">
                                <MapPin className="w-3 h-3" />
                                <span>At {friend.currentVenue.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRemovingFriend(friend.userId)}
                            className="hover:text-red-600"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:text-red-600">
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requests" className="flex-1 mt-4">
          <ScrollArea className="h-full pr-4">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.senderAvatar} />
                            <AvatarFallback>{request.senderName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{request.senderName}</p>
                            <p className="text-sm text-gray-600">@{request.senderUsername}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectRequest(request.id)}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!removingFriend} onOpenChange={() => setRemovingFriend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove this friend? You can always send them another friend request later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => removingFriend && handleRemoveFriend(removingFriend)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
