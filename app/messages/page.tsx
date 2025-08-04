import { Search, Send, MoreVertical, Phone, Video } from "lucide-react"
import Navigation from "@/components/navigation"

export default function MessagesPage() {
  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Sure, I can pick you up at 8 AM tomorrow",
      time: "2m ago",
      unread: 2,
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    {
      id: 2,
      name: "Mike Chen",
      lastMessage: "The MacBook is still available if you're interested",
      time: "1h ago",
      unread: 0,
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
    },
    {
      id: 3,
      name: "Emma Wilson",
      lastMessage: "Thanks for the quick response!",
      time: "3h ago",
      unread: 1,
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    {
      id: 4,
      name: "David Rodriguez",
      lastMessage: "Can we schedule an interview for next week?",
      time: "1d ago",
      unread: 0,
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
    },
  ]

  const currentMessages = [
    {
      id: 1,
      sender: "Sarah Johnson",
      message: "Hi! I saw your post about daily commute sharing. Are you still looking for someone?",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      sender: "You",
      message: "Yes, absolutely! I leave downtown around 8 AM every weekday. Would that work for you?",
      time: "10:32 AM",
      isOwn: true,
    },
    {
      id: 3,
      sender: "Sarah Johnson",
      message: "Perfect! That timing works great for me. What's the cost sharing arrangement?",
      time: "10:35 AM",
      isOwn: false,
    },
    {
      id: 4,
      sender: "You",
      message: "I was thinking $15 per day, which covers gas and parking. Does that sound fair?",
      time: "10:37 AM",
      isOwn: true,
    },
    {
      id: 5,
      sender: "Sarah Johnson",
      message: "Sure, I can pick you up at 8 AM tomorrow",
      time: "10:40 AM",
      isOwn: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      conversation.id === 1 ? "bg-orange-50 border-l-4 border-l-orange-500" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={conversation.avatar || "/placeholder.svg"}
                          alt={conversation.name}
                          className="w-10 h-10 rounded-full"
                        />
                        {conversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.name}</h3>
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          {conversation.unread > 0 && (
                            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="hidden md:flex md:w-2/3 flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src="/placeholder.svg?height=40&width=40"
                      alt="Sarah Johnson"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Sarah Johnson</h3>
                    <p className="text-sm text-green-600">Online</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.isOwn ? "text-orange-100" : "text-gray-500"}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                  <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
