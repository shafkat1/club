'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Card } from '@/app/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { ScrollArea } from '@/app/components/ui/scroll-area'

interface Conversation {
  id: string
  user: {
    name: string
    username: string
    avatar: string
    online: boolean
  }
  lastMessage?: {
    content: string
    timestamp: string
  }
  unreadCount: number
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Chen',
      username: 'sarahchen',
      avatar: '👩‍🦰',
      online: true,
    },
    lastMessage: {
      content: 'Sounds good! See you there.',
      timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    unreadCount: 0,
  },
  {
    id: '2',
    user: {
      name: 'Mike Johnson',
      username: 'mikej',
      avatar: '👨',
      online: true,
    },
    lastMessage: {
      content: 'Did you see the new bar downtown?',
      timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    unreadCount: 2,
  },
  {
    id: '3',
    user: {
      name: 'Emma Davis',
      username: 'emmad',
      avatar: '👩',
      online: false,
    },
    lastMessage: {
      content: 'Thanks for the drink! 🍹',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    unreadCount: 0,
  },
  {
    id: '4',
    user: {
      name: 'James Wilson',
      username: 'jameswilson',
      avatar: '👨‍🦱',
      online: true,
    },
    lastMessage: {
      content: 'Are you coming to the event?',
      timestamp: new Date(Date.now() - 24 * 60 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    unreadCount: 1,
  },
  {
    id: '5',
    user: {
      name: 'Lisa Anderson',
      username: 'lisaanderson',
      avatar: '👩‍🦱',
      online: false,
    },
    lastMessage: {
      content: 'Let me know when you're free!',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    unreadCount: 0,
  },
]

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Conversation List */}
      <div className="w-full max-w-md border-r border-gray-200 bg-white flex flex-col">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm p-6">
          <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
            <MessageCircle className="w-8 h-8" />
            Messages
          </h1>
        </div>

        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="font-medium mb-2 text-gray-900">No conversations yet</h3>
              <p className="text-sm text-gray-600">When someone accepts your offer, you can start chatting!</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-indigo-50 transition-colors border-0 ${
                    selectedConversation?.id === conversation.id ? 'bg-indigo-100' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                        <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.user.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">{conversation.user.name}</p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-600">{conversation.lastMessage.timestamp}</p>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-700 truncate">{conversation.lastMessage.content}</p>
                      )}
                    </div>

                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 shrink-0">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col hidden md:flex">
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.user.avatar} />
                <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{selectedConversation.user.name}</p>
                <p className="text-xs text-gray-600">
                  {selectedConversation.user.online ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Chat implementation coming soon</p>
              <p className="text-sm mt-2">Full chat UI will be displayed here</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
