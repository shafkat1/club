'use client'

const conversations = [
  { id: '1', name: 'Sarah', avatar: '👩‍🦰', lastMessage: 'Hey! Let\'s meet up soon!', unread: 2 },
  { id: '2', name: 'Emma', avatar: '👩', lastMessage: 'Thanks for the drink offer!', unread: 0 },
  { id: '3', name: 'Alex', avatar: '👨', lastMessage: 'See you at the bar tonight', unread: 1 },
  { id: '4', name: 'Jordan', avatar: '👨‍🦱', lastMessage: 'Are you coming to the party?', unread: 0 },
]

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations List */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>

        <div className="flex-1 overflow-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-3xl">{conv.avatar}</span>
                  {conv.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {conv.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{conv.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-900">Select a conversation</h2>
          <p className="text-gray-600 mt-2">Choose a person to start chatting</p>
        </div>
      </div>
    </div>
  )
}
