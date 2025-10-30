'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog'
import { Card } from '@/app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Badge } from '@/app/components/ui/badge'
import { Textarea } from '@/app/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Coffee, Martini, UtensilsCrossed, MapPin } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  price: number
  emoji: string
  category: 'coffee' | 'cocktail' | 'food'
  venueId?: string
  description?: string
  size?: string
}

interface User {
  id: string
  name: string
  avatar?: string
  username: string
}

interface Venue {
  id: string
  name: string
  type: 'cafe' | 'bar' | 'nightclub' | 'restaurant'
}

interface SendOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  menuItems: MenuItem[]
  onSend: (item: MenuItem, message: string) => void
  venue?: Venue | null
}

export function SendOfferDialog({
  open,
  onOpenChange,
  user,
  menuItems,
  onSend,
  venue,
}: SendOfferDialogProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (selectedItem) {
      onSend(selectedItem, message)
      setSelectedItem(null)
      setMessage('')
      onOpenChange(false)
    }
  }

  // Filter menu items by venue if venue is provided
  const filteredItems = venue ? menuItems.filter((item) => item.venueId === venue.id) : menuItems

  const coffeeItems = filteredItems.filter((item) => item.category === 'coffee')
  const cocktailItems = filteredItems.filter((item) => item.category === 'cocktail')
  const foodItems = filteredItems.filter((item) => item.category === 'food')

  const venueTypeColors: Record<string, string> = {
    cafe: 'bg-amber-100 text-amber-800 border-amber-200',
    bar: 'bg-orange-100 text-orange-800 border-orange-200',
    nightclub: 'bg-purple-100 text-purple-800 border-purple-200',
    restaurant: 'bg-red-100 text-red-800 border-red-200',
  }

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => (
      <Card
        key={item.id}
        className={`p-3 cursor-pointer transition-all ${
          selectedItem?.id === item.id ? 'border-indigo-600 bg-indigo-50' : 'hover:border-indigo-300'
        }`}
        onClick={() => setSelectedItem(item)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{item.emoji}</div>
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
            </div>
          </div>
          {selectedItem?.id === item.id && (
            <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          )}
        </div>
      </Card>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send a treat to {user.name}</DialogTitle>
          <DialogDescription>Choose a drink or food item to send as a gift</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info with Venue */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">{user.name}</p>
                {venue && (
                  <Badge className={venueTypeColors[venue.type]} variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {venue.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </div>
          </div>

          {/* Venue-specific menu note */}
          {venue && filteredItems.length > 0 && (
            <div className="text-sm text-gray-600 px-1">
              <p>Send {user.name.split(' ')[0]} something from <span className="font-medium">{venue.name}</span>'s menu</p>
            </div>
          )}

          {/* Menu Selection */}
          <Tabs defaultValue={coffeeItems.length > 0 ? 'coffee' : cocktailItems.length > 0 ? 'cocktail' : 'food'}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="coffee" disabled={coffeeItems.length === 0}>
                <Coffee className="h-4 w-4 mr-2" />
                Coffee
              </TabsTrigger>
              <TabsTrigger value="cocktail" disabled={cocktailItems.length === 0}>
                <Martini className="h-4 w-4 mr-2" />
                Drinks
              </TabsTrigger>
              <TabsTrigger value="food" disabled={foodItems.length === 0}>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Food
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coffee" className="space-y-2">
              {coffeeItems.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Coffee className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No coffee items available{venue ? ' at this venue' : ''}</p>
                </div>
              ) : (
                renderMenuItems(coffeeItems)
              )}
            </TabsContent>

            <TabsContent value="cocktail" className="space-y-2">
              {cocktailItems.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Martini className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No drinks available{venue ? ' at this venue' : ''}</p>
                </div>
              ) : (
                renderMenuItems(cocktailItems)
              )}
            </TabsContent>

            <TabsContent value="food" className="space-y-2">
              {foodItems.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No food items available{venue ? ' at this venue' : ''}</p>
                </div>
              ) : (
                renderMenuItems(foodItems)
              )}
            </TabsContent>
          </Tabs>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">Add a message (optional)</label>
            <Textarea
              placeholder="Say something nice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              onClick={handleSend}
              disabled={!selectedItem}
            >
              Send ${selectedItem?.price.toFixed(2) || '0.00'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
