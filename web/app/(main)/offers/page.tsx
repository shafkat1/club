'use client'

import { useState } from 'react'
import { Gift, Check, X } from 'lucide-react'

interface Offer {
  id: string
  from: string
  drink: string
  venue: string
  message: string
  avatar: string
  status: 'pending' | 'accepted' | 'declined'
  type: 'sent' | 'received'
}

const mockOffers: Offer[] = [
  {
    id: '1',
    from: 'Sarah',
    drink: '🍷 Glass of Wine',
    venue: 'The Golden Gate',
    message: 'Enjoyed our chat! Lets grab a drink?',
    avatar: '👩',
    status: 'pending',
    type: 'received',
  },
  {
    id: '2',
    from: 'Alex',
    drink: '🍺 Craft Beer',
    venue: 'Mission Brewery',
    message: 'On me!',
    avatar: '👨',
    status: 'accepted',
    type: 'sent',
  },
  {
    id: '3',
    from: 'Emma',
    drink: '🍹 Cocktail',
    venue: 'Castro Night Club',
    message: 'Lets celebrate!',
    avatar: '👩‍🦰',
    status: 'pending',
    type: 'received',
  },
  {
    id: '4',
    from: 'James',
    drink: '🥃 Whiskey Shot',
    venue: 'Downtown Bar',
    message: 'Cheers!',
    avatar: '👨‍💼',
    status: 'declined',
    type: 'sent',
  },
]

export default function OffersPage() {
  const [offers, setOffers] = useState(mockOffers)
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  const handleAccept = (id: string) => {
    setOffers(
      offers.map((o) =>
        o.id === id ? { ...o, status: 'accepted' as const } : o,
      ),
    )
  }

  const handleDecline = (id: string) => {
    setOffers(
      offers.map((o) =>
        o.id === id ? { ...o, status: 'declined' as const } : o,
      ),
    )
  }

  const receivedOffers = offers.filter((o) => o.type === 'received')
  const sentOffers = offers.filter((o) => o.type === 'sent')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Offers</h1>
        <p className="text-gray-600 mt-1">Send and receive drink offers</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`py-4 px-2 font-semibold transition-all ${
              activeTab === 'received'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Received {receivedOffers.length > 0 && `(${receivedOffers.length})`}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-4 px-2 font-semibold transition-all ${
              activeTab === 'sent'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sent {sentOffers.length > 0 && `(${sentOffers.length})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="grid gap-4">
          {(activeTab === 'received' ? receivedOffers : sentOffers).map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-2xl">
                    {offer.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{offer.from}</h3>
                    <p className="text-sm text-gray-600">{offer.drink}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(offer.status)}`}
                >
                  {offer.status}
                </span>
              </div>

              <p className="text-gray-700 mb-4">"{offer.message}"</p>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">📍 {offer.venue}</p>
                {activeTab === 'received' && offer.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecline(offer.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(offer.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition font-medium"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {(activeTab === 'received' ? receivedOffers : sentOffers).length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h2 className="text-2xl font-bold text-gray-900">No {activeTab} offers</h2>
              <p className="text-gray-600 mt-2">
                {activeTab === 'received'
                  ? 'Check back later for offers from new friends!'
                  : 'Send an offer to someone special!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
