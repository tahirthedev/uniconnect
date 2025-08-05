'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  Send, 
  MessageCircle,
  User
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  messageBody: string;
  createdAt: string;
  status: string;
}

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  rideTitle: string;
  recipientId?: string;
  rideId?: string;
}

export default function MessagingModal({ 
  isOpen, 
  onClose, 
  recipientName, 
  rideTitle,
  recipientId,
  rideId 
}: MessagingModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Get current user info
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        setCurrentUser(JSON.parse(userInfo));
      }
      
      // Load conversation if we have recipient ID
      if (recipientId) {
        loadConversation();
      }
    }
  }, [isOpen, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    if (!recipientId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getConversation(recipientId);
      setMessages(response.conversation?.messages || []);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipientId) return;

    setSending(true);
    try {
      const messageData = {
        messageBody: newMessage.trim(),
        relatedPost: rideId || null
      };

      const response = await apiClient.sendMessage(recipientId, messageData);
      
      // Add the new message to the conversation
      if (response.data) {
        setMessages(prev => [...prev, response.data]);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-GB');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-4xl h-[90vh] sm:h-[600px] flex flex-col mx-2 sm:mx-4">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-3 sm:px-6">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg truncate">Message {recipientName}</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 truncate">About: {rideTitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500 text-sm">Loading conversation...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                <p className="text-sm text-center px-4">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = currentUser && message.sender?._id === currentUser._id;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 my-2 sm:my-4">
                        {formatDate(message.createdAt)}
                      </div>
                    )}
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-md px-3 py-2 rounded-lg break-words ${
                        isCurrentUser 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white border'
                      }`}>
                        {!isCurrentUser && (
                          <div className="flex items-center mb-1">
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="text-xs font-medium truncate">{message.sender.name}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.messageBody}</p>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t bg-white p-3 sm:p-4">
            {!recipientId ? (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">Messaging functionality requires user authentication.</p>
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  className="mt-2"
                  size="sm"
                >
                  Sign In to Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  disabled={sending}
                  maxLength={1000}
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-orange-500 hover:bg-orange-600 flex-shrink-0"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
