'use client'

import { useState } from 'react'
import { Check, X, MessageCircle, Ticket, Gift } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'

interface Offer {
  id: string
  sender: {
    name: string
    avatar: string
  }
  receiver?: {
    name: string
    avatar: string
  }
  item: {
    name: string
    price: string
    emoji: string
  }
  message?: string
  timestamp: string
  status: 'pending' | 'accepted' | 'declined' | 'redeemed' | 'expired'
  type: 'sent' | 'received'
}

const mockReceivedOffers: Offer[] = [
  {
    id: '1',
    sender: { name: 'Sarah Chen', avatar: '👩‍🦰' },
    item: { name: 'Beer', price: '$8', emoji: '🍺' },
    message: 'Let\'s grab a drink!',
    timestamp: '2 hours ago',
    status: 'pending',
    type: 'received',
  },
  {
    id: '2',
    sender: { name: 'Mike Johnson', avatar: '👨' },
    item: { name: 'Cocktail', price: '$12', emoji: '🍹' },
    message: '',
    timestamp: '1 day ago',
    status: 'accepted',
    type: 'received',
  },
  {
    id: '3',
    sender: { name: 'Emma Davis', avatar: '👩' },
    item: { name: 'Wine', price: '$10', emoji: '🍷' },
    message: 'Thank you for yesterday!',
    timestamp: '3 days ago',
    status: 'redeemed',
    type: 'received',
  },
]

const mockSentOffers: Offer[] = [
  {
    id: '4',
    receiver: { name: 'James Wilson', avatar: '👨‍🦱' },
    sender: { name: 'You', avatar: '👤' },
    item: { name: 'Vodka Shot', price: '$5', emoji: '🥃' },
    message: 'Cheers!',
    timestamp: '5 hours ago',
    status: 'pending',
    type: 'sent',
  },
  {
    id: '5',
    receiver: { name: 'Lisa Anderson', avatar: '👩‍🦱' },
    sender: { name: 'You', avatar: '👤' },
    item: { name: 'Margarita', price: '$11', emoji: '🍸' },
    message: '',
    timestamp: '1 day ago',
    status: 'accepted',
    type: 'sent',
  },
]

export default function OffersPage() {
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>(mockReceivedOffers)
  const [sentOffers, setSentOffers] = useState<Offer[]>(mockSentOffers)

  const handleAcceptOffer = (offerId: string) => {
    setReceivedOffers(
      receivedOffers.map((o) => (o.id === offerId ? { ...o, status: 'accepted' as const } : o))
    )
  }

  const handleDeclineOffer = (offerId: string) => {
    setReceivedOffers(
      receivedOffers.map((o) => (o.id === offerId ? { ...o, status: 'declined' as const } : o))
    )
  }

  const OfferCard = ({ offer }: { offer: Offer }) => {
    const user = offer.type === 'received' ? offer.sender : offer.receiver
    const isPending = offer.status === 'pending'
    const isAccepted = offer.status === 'accepted'
    const isRedeemed = offer.status === 'redeemed'

    return (
      <Card className="p-5 shadow-lg hover:shadow-xl transition-shadow border-0">
        <div className="flex gap-4">
          {/* Item */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl shadow-md">
              {offer.item.emoji}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 ring-2 ring-indigo-100">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {user?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{offer.timestamp}</p>
                </div>
              </div>
              <Badge
                className={`${
                  offer.status === 'accepted' || offer.status === 'redeemed'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : offer.status === 'declined' || offer.status === 'expired'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                }`}
              >
                {offer.status === 'redeemed' ? '✓ Redeemed' : offer.status}
              </Badge>
            </div>

            <div className="mb-3">
              <p className="font-medium text-gray-900">
                {offer.type === 'received' ? 'Wants to buy you' : 'You offered'} {offer.item.name}
              </p>
              <p className="text-sm font-semibold text-indigo-600">{offer.item.price}</p>
            </div>

            {offer.message && (
              <p className="text-sm bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-700 p-3 rounded-lg mb-3 border border-indigo-100">
                {offer.message}
              </p>
            )}

            {/* Actions */}
            {offer.type === 'received' && isPending && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md"
                  onClick={() => handleAcceptOffer(offer.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDeclineOffer(offer.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {offer.type === 'sent' && isPending && (
              <p className="text-sm text-gray-600">Waiting for response...</p>
            )}

            {(isAccepted || isRedeemed) && (
              <div className="flex gap-2">
                {offer.type === 'received' && !isRedeemed && (
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    View Code
                  </Button>
                )}
                <Button
                  size="sm"
                  className={`flex-1 ${isRedeemed ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md' : ''}`}
                  variant={isRedeemed ? 'default' : 'outline'}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isRedeemed ? 'Chat' : 'Message'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm p-6">
        <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
          <Gift className="w-8 h-8" />
          Drink Offers
        </h1>
      </div>

      <Tabs defaultValue="received" className="flex-1 flex flex-col px-6 py-4">
        <TabsList className="w-fit">
          <TabsTrigger value="received">Received ({receivedOffers.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentOffers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="flex-1 mt-4">
          <ScrollArea className="h-full pr-4">
            {receivedOffers.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No received offers yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sent" className="flex-1 mt-4">
          <ScrollArea className="h-full pr-4">
            {sentOffers.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No sent offers yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
