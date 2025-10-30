'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { MapPin, Heart, Gift, Star, Users, Filter, UserCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import { Navigation } from '@/app/components/Navigation'

interface User {
  id: string
  name: string
  username: string
  age: number
  location: string
  bio: string
  avatar: string
  interests: string[]
  online?: boolean
  stats?: {
    rating: number
    drinksGiven: number
  }
  verificationBadges?: {
    ageVerified: boolean
  }
  wantsDrink?: boolean
  buyingDrinks?: boolean
  lookingFor?: 'friendship' | 'dating' | 'both' | 'just-social'
  preferredDrinks?: string[]
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: 'sarahchen',
    age: 26,
    location: 'San Francisco, CA',
    bio: 'Foodie & adventure seeker 🌍',
    avatar: '👩‍🦰',
    interests: ['Food', 'Hiking', 'Music'],
    online: true,
    stats: { rating: 4.8, drinksGiven: 12 },
    verificationBadges: { ageVerified: true },
    wantsDrink: true,
    lookingFor: 'friendship',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    username: 'mikej',
    age: 30,
    location: 'Oakland, CA',
    bio: 'Tech geek | Always up for a good conversation',
    avatar: '👨',
    interests: ['Tech', 'Gaming', 'Coffee'],
    online: true,
    stats: { rating: 4.6, drinksGiven: 8 },
    verificationBadges: { ageVerified: true },
    buyingDrinks: true,
    lookingFor: 'just-social',
  },
  {
    id: '3',
    name: 'Emma Davis',
    username: 'emmad',
    age: 25,
    location: 'Berkeley, CA',
    bio: 'Artist & coffee lover ☕',
    avatar: '👩',
    interests: ['Art', 'Coffee', 'Books'],
    online: false,
    stats: { rating: 4.9, drinksGiven: 15 },
    verificationBadges: { ageVerified: true },
    wantsDrink: true,
    lookingFor: 'dating',
  },
  {
    id: '4',
    name: 'James Wilson',
    username: 'jameswilson',
    age: 28,
    location: 'San Francisco, CA',
    bio: 'Sports enthusiast & foodie',
    avatar: '👨‍🦱',
    interests: ['Sports', 'Food', 'Travel'],
    online: true,
    stats: { rating: 4.7, drinksGiven: 10 },
    verificationBadges: { ageVerified: true },
    buyingDrinks: true,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    username: 'lisaanderson',
    age: 27,
    location: 'San Jose, CA',
    bio: 'Fitness enthusiast & food explorer',
    avatar: '👩‍🦱',
    interests: ['Fitness', 'Food', 'Gaming'],
    online: true,
    stats: { rating: 4.5, drinksGiven: 6 },
    verificationBadges: { ageVerified: true },
    wantsDrink: true,
  },
  {
    id: '6',
    name: 'David Kim',
    username: 'davidkim',
    age: 29,
    location: 'Mountain View, CA',
    bio: 'Music lover & outdoor adventurer',
    avatar: '👨‍🦲',
    interests: ['Music', 'Outdoor', 'Art'],
    online: false,
    stats: { rating: 4.8, drinksGiven: 11 },
    verificationBadges: { ageVerified: true },
    buyingDrinks: true,
  },
]

interface Filters {
  status: 'all' | 'alone' | 'in-group'
  sortBy: 'just-arrived' | 'verified' | 'high-rating' | 'distance'
  gender?: string[]
  ageRange?: { min: number; max: number }
}

export default function DiscoverPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    sortBy: 'just-arrived',
  })
  const [likedUsers, setLikedUsers] = useState<string[]>([])

  const handleLike = (userId: string) => {
    setLikedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSendOffer = (user: User) => {
    console.log('Send offer to:', user.name)
  }

  const handleStatusFilter = (status: 'all' | 'alone' | 'in-group') => {
    setFilters((prev) => ({ ...prev, status }))
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-indigo-600">Discover People</h1>
                <p className="text-sm text-gray-600 mt-1">Connect with people nearby and buy them drinks</p>
              </div>

              {/* Filters Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Users</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    {/* Gender Filter */}
                    <div>
                      <Label className="mb-3 block">Gender</Label>
                      <div className="space-y-2">
                        {['male', 'female', 'non-binary', 'other'].map((gender) => (
                          <div key={gender} className="flex items-center space-x-2">
                            <Checkbox id={gender} />
                            <label htmlFor={gender} className="text-sm capitalize cursor-pointer">
                              {gender}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Age Range Filter */}
                    <div>
                      <Label className="mb-3 block">Age Range</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ages</SelectItem>
                          <SelectItem value="18-25">18-25</SelectItem>
                          <SelectItem value="26-35">26-35</SelectItem>
                          <SelectItem value="36+">36+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <Label className="mb-3 block">Status</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Everyone</SelectItem>
                          <SelectItem value="alone">Solo</SelectItem>
                          <SelectItem value="in-group">In a Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <Label className="mb-3 block">Sort By</Label>
                      <Select defaultValue="just-arrived">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="just-arrived">Just Arrived</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="high-rating">High Rating</SelectItem>
                          <SelectItem value="distance">Distance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full" variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                size="sm"
                variant={filters.status === 'all' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filters.status === 'alone' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('alone')}
              >
                <UserCircle className="h-4 w-4 mr-1" />
                Solo
              </Button>
              <Button
                size="sm"
                variant={filters.status === 'in-group' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('in-group')}
              >
                <Users className="h-4 w-4 mr-1" />
                Groups
              </Button>
            </div>
          </div>
        </div>

        {/* User Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card
                key={user.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1"
              >
                <div className="h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                </div>

                <div className="p-5 -mt-16">
                  <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                      <Avatar className="h-28 w-28 border-[3px] border-white shadow-lg ring-2 ring-indigo-100">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.online && (
                        <div className="absolute bottom-2 right-2 h-5 w-5 bg-emerald-500 border-[3px] border-white rounded-full shadow-lg">
                          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`rounded-full mt-16 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg ${
                        likedUsers.includes(user.id) ? 'text-rose-500' : 'text-gray-400'
                      }`}
                      onClick={() => handleLike(user.id)}
                    >
                      <Heart className="h-5 w-5" fill={likedUsers.includes(user.id) ? 'currentColor' : 'none'} />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>

                    {user.age && user.location && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium">{user.age}</span> years
                        </span>
                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{user.location}</span>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    {user.stats && (
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span>{user.stats.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          <span>{user.stats.drinksGiven} given</span>
                        </div>
                      </div>
                    )}

                    {user.bio && <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{user.bio}</p>}

                    {user.interests && user.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {user.interests.slice(0, 3).map((interest, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-100 hover:from-indigo-100 hover:to-purple-100 transition-colors"
                          >
                            {interest}
                          </Badge>
                        ))}
                        {user.interests.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{user.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]"
                      onClick={() => handleSendOffer(user)}
                    >
                      <span className="mr-2">🍺</span>
                      Buy a Drink
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
