'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Building, 
  Users, 
  DollarSign,
  ArrowLeftRight,
  Mail,
  MessageCircle,
  Globe,
  CheckCircle,
  Star,
  TrendingUp,
  Shield
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import MessagingModal from '@/components/messaging-modal';

interface CurrencyExchange {
  _id: string;
  title: string;
  description: string;
  price?: {
    amount: number;
    type: string;
    currency: string;
  };
  location?: {
    city: string;
    state?: string;
    country: string;
    type?: string;
  };
  details?: {
    fromCurrency?: string;
    toCurrency?: string;
    exchangeRate?: number;
    minimumAmount?: number;
    maximumAmount?: number;
    fees?: string;
    meetingPreference?: string;
  };
  author: {
    _id: string;
    name: string;
    email: string;
  };
  authorInfo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  category: string;
}

export default function CurrencyExchangePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [exchange, setExchange] = useState<CurrencyExchange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messagingModal, setMessagingModal] = useState({
    isOpen: false,
    recipientName: '',
    recipientId: '',
    exchangeTitle: '',
    exchangeId: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchExchange(params.id as string);
    }
  }, [params.id]);

  const fetchExchange = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getPost(id);
      
      if (response.success && response.data) {
        setExchange(response.data);
      } else {
        setError('Exchange not found');
      }
    } catch (error) {
      console.error('Error fetching currency exchange:', error);
      setError('Failed to load exchange');
    } finally {
      setLoading(false);
    }
  };

  const handleContactExchanger = () => {
    if (!exchange) return;
    
    const author = exchange.authorInfo || exchange.author;
    setMessagingModal({
      isOpen: true,
      recipientName: author?.name || 'Unknown',
      recipientId: author?._id || '',
      exchangeTitle: exchange.title,
      exchangeId: exchange._id
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !exchange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Exchange Not Found</h1>
              <p className="text-gray-600 mb-6">The currency exchange you're looking for doesn't exist or has been removed.</p>
              <Link href="/currency">
                <Button>Browse Currency Exchange</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/currency" className="mr-4">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-white/80">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              <DollarSign className="h-3 w-3 mr-1" />
              Currency Exchange
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900">{exchange.title}</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Exchange Overview */}
            <Card>
              <CardContent className="p-0">
                <div className="h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-t-lg flex items-center justify-center">
                  <div className="flex items-center gap-4 text-yellow-700">
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-1" />
                      <span className="text-lg font-bold">{exchange.details?.fromCurrency || 'Currency'}</span>
                    </div>
                    <ArrowLeftRight className="h-6 w-6" />
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-1" />
                      <span className="text-lg font-bold">{exchange.details?.toCurrency || 'Currency'}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {exchange.details?.exchangeRate && (
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        1 {exchange.details.fromCurrency} = {exchange.details.exchangeRate} {exchange.details.toCurrency}
                      </div>
                      <p className="text-sm text-gray-500">Exchange Rate</p>
                    </div>
                  )}
                  
                  {(exchange.details?.minimumAmount || exchange.details?.maximumAmount) && (
                    <div className="flex justify-center gap-4 mb-4">
                      {exchange.details.minimumAmount && (
                        <Badge variant="outline">
                          Min: {exchange.details.fromCurrency} {exchange.details.minimumAmount}
                        </Badge>
                      )}
                      {exchange.details.maximumAmount && (
                        <Badge variant="outline">
                          Max: {exchange.details.fromCurrency} {exchange.details.maximumAmount}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {exchange.description}
                </p>
              </CardContent>
            </Card>

            {/* Exchange Details */}
            {exchange.details && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Exchange Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exchange.details.fromCurrency && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">From Currency</label>
                        <p className="text-gray-900">{exchange.details.fromCurrency}</p>
                      </div>
                    )}
                    {exchange.details.toCurrency && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">To Currency</label>
                        <p className="text-gray-900">{exchange.details.toCurrency}</p>
                      </div>
                    )}
                    {exchange.details.fees && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fees</label>
                        <p className="text-gray-900">{exchange.details.fees}</p>
                      </div>
                    )}
                    {exchange.details.meetingPreference && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Meeting Preference</label>
                        <p className="text-gray-900">{exchange.details.meetingPreference}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Exchanger */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Exchanger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">{(exchange.authorInfo || exchange.author)?.name}</p>
                    <p className="text-sm text-gray-500">Exchange Partner</p>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={handleContactExchanger}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Exchange
                </Button>

                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  Always verify exchange details before meeting
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {exchange.location?.city}
                  {exchange.location?.state && `, ${exchange.location.state}`}
                  {exchange.location?.country && `, ${exchange.location.country}`}
                </p>
              </CardContent>
            </Card>

            {/* Posted Date */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Posted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{formatDate(exchange.createdAt)}</p>
              </CardContent>
            </Card>

            {/* Exchange Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 space-y-2">
                <ul className="space-y-1">
                  <li>• Meet in public places</li>
                  <li>• Verify exchange rates beforehand</li>
                  <li>• Count money carefully</li>
                  <li>• Trust your instincts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Messaging Modal */}
        <MessagingModal
          isOpen={messagingModal.isOpen}
          onClose={() => setMessagingModal({ ...messagingModal, isOpen: false })}
          recipientName={messagingModal.recipientName}
          recipientId={messagingModal.recipientId}
          rideTitle={messagingModal.exchangeTitle}
          rideId={messagingModal.exchangeId}
        />
      </div>
    </div>
  );
}
