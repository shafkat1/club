'use client'

import { useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'

interface Message {
  id: string
  sender: string
  text: string
  timestamp: string
  isMine: boolean
}

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: boolean
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Sarah',
    avatar: '👩',
    lastMessage: 'That sounds great! See you then 😊',
    timestamp: '2 min',
    unread: true,
  },
  {
    id: '2',
    name: 'Alex',
    avatar: '👨',
    lastMessage: 'Thanks for the beer recommendation!',
    timestamp: '1 hour',
    unread: false,
  },
  {
    id: '3',
    name: 'Emma',
    avatar: '👩‍🦰',
    lastMessage: 'Let me know when you are free',
    timestamp: '3 hours',
    unread: false,
  },
]

const mockMessages: Message[] = [
  { id: '1', sender: 'Sarah', text: 'Hey! How was your weekend?', timestamp: '10:30 AM', isMine: false },
  { id: '2', sender: 'Me', text: 'Hey Sarah! It was great, went to that new bar downtown', timestamp: '10:32 AM', isMine: true },
  { id: '3', sender: 'Sarah', text: 'Oh nice! Which one? I've been looking for new places', timestamp: '10:33 AM', isMine: false },
  { id: '4', sender: 'Me', text: 'The Golden Gate! Their cocktails are amazing', timestamp: '10:35 AM', isMine: true },
  { id: '5', sender: 'Sarah', text: 'That sounds great! See you then 😊', timestamp: '10:36 AM', isMine: false },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0].id)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState(mockMessages)

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      sender: 'Me',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    }

    setMessages([...messages, newMessage])
    setMessageText('')
  }

  const currentConversation = mockConversations.find((c) => c.id === selectedConversation)

  return (
    <div className="flex-1 flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600 mt-1">Your conversations</p>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition ${
                selectedConversation === conversation.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-lg flex-shrink-0">
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">{conversation.timestamp}</span>
                  </div>
                  <p className={`text-sm truncate ${conversation.unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread && <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat View */}
      {currentConversation && (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-2xl">
              {currentConversation.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentConversation.name}</h2>
              <p className="text-sm text-gray-600">Active now</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.isMine
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isMine ? 'text-white/70' : 'text-gray-600'}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Paperclip className="h-5 w-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Smile className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition"
              >
                <Send className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
