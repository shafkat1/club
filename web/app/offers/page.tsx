'use client'

import { Gift, Check, X } from 'lucide-react'

const offers = [
  { id: '1', from: 'Sarah', item: 'Margarita', status: 'pending', avatar: '👩‍🦰' },
  { id: '2', from: 'You', to: 'Emma', item: 'Mojito', status: 'accepted', avatar: '👩' },
  { id: '3', from: 'Alex', item: 'Beer', status: 'declined', avatar: '👨' },
  { id: '4', from: 'You', to: 'Jordan', item: 'Cosmopolitan', status: 'pending', avatar: '👨‍🦱' },
]

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
        <p className="text-sm text-gray-600 mt-1">Send and receive drink offers</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6">
          <div className="space-y-3">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{offer.avatar}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {offer.from === 'You' ? `You → ${offer.to}` : `${offer.from} sent you`} 🍹 <span className="text-purple-600">{offer.item}</span>
                      </h3>
                      <p
                        className={`text-sm capitalize font-medium ${
                          offer.status === 'pending'
                            ? 'text-yellow-600'
                            : offer.status === 'accepted'
                              ? 'text-green-600'
                              : 'text-red-600'
                        }`}
                      >
                        {offer.status}
                      </p>
                    </div>
                  </div>

                  {offer.status === 'pending' && offer.from !== 'You' && (
                    <div className="flex gap-2">
                      <button className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition">
                        <Check size={20} />
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition">
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
