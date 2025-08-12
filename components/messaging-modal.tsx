'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
    id?: string; // Add optional id field
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
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Get current user info from multiple possible sources
      let user = null;
      
      // Try userInfo first
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          user = JSON.parse(userInfo);
        } catch (e) {
          console.error('Failed to parse userInfo:', e);
        }
      }
      
      // Try user as fallback
      if (!user) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            user = JSON.parse(userData);
          } catch (e) {
            console.error('Failed to parse user:', e);
          }
        }
      }
      
      // Try token to get user ID
      if (!user) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Decode JWT token to get user ID
            const payload = JSON.parse(atob(token.split('.')[1]));
            user = { _id: payload.userId || payload.id, name: 'Current User' };
          } catch (e) {
            console.error('Failed to decode token:', e);
          }
        }
      }
      
      if (user) {
        setCurrentUser(user);
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
      const messageData: any = {
        messageBody: newMessage.trim()
      };

      // Only include relatedPost if rideId exists
      if (rideId) {
        messageData.relatedPost = rideId;
      }

      const response = await apiClient.sendMessage(recipientId, messageData);
      
      // Add the new message to the conversation
      if (response.data) {
        setMessages(prev => [...prev, response.data]);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Message failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
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
      <Card className="w-full max-w-2xl lg:max-w-4xl h-[95vh] sm:h-[85vh] lg:h-[600px] flex flex-col mx-2 sm:mx-4">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 sm:px-6 border-b">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <MessageCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold truncate">Message {recipientName}</CardTitle>
              <p className="text-sm text-gray-600 truncate">About: {rideTitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 flex-shrink-0 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Loading conversation...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageCircle className="h-8 w-8 mb-2" />
                <p className="text-center px-4">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                // More robust current user detection
                const currentUserId = currentUser?._id || currentUser?.id;
                const messageSenderId = message.sender?._id || message.sender?.id;
                const isCurrentUser = currentUserId && messageSenderId && 
                  (currentUserId === messageSenderId || currentUserId.toString() === messageSenderId.toString());
                
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                return (
                  <div key={message._id} className="w-full">
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 my-4">
                        <span className="bg-white px-3 py-1 rounded-full border">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`max-w-[80%] sm:max-w-[70%] lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        isCurrentUser 
                          ? 'bg-orange-500 text-white rounded-br-md' 
                          : 'bg-white border rounded-bl-md'
                      }`}>
                        {!isCurrentUser && (
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                              <User className="h-3 w-3 text-gray-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{message.sender.name}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.messageBody}
                        </p>
                        <p className={`text-xs mt-2 ${
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
          <div className="border-t bg-white p-4">
            {!recipientId ? (
              <div className="text-center text-gray-500 py-4">
                <p className="mb-3">Messaging functionality requires user authentication.</p>
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  className="bg-orange-500 hover:bg-orange-600"
                  size="sm"
                >
                  Sign In to Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={sending}
                    maxLength={1000}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 h-12 w-12 rounded-full flex-shrink-0"
                  size="icon"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
