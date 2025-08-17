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
  ShoppingBag,
  Mail,
  MessageCircle,
  Globe,
  CheckCircle,
  Star,
  Heart,
  Share2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import MessagingModal from '@/components/messaging-modal';

interface MarketplaceItem {
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
    condition?: string;
    brand?: string;
    model?: string;
    year?: string;
    category?: string;
    features?: string[];
  };
  images?: string[];
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

export default function MarketplaceItemPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messagingModal, setMessagingModal] = useState({
    isOpen: false,
    recipientName: '',
    recipientId: '',
    itemTitle: '',
    itemId: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchItem(params.id as string);
    }
  }, [params.id]);

  const fetchItem = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getPost(id);
      
      if (response.success && response.post) {
        setItem(response.post);
      } else {
        setError('Item not found');
      }
    } catch (error) {
      console.error('Error fetching marketplace item:', error);
      setError('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = () => {
    if (!item) return;
    
    const author = item.authorInfo || item.author;
    setMessagingModal({
      isOpen: true,
      recipientName: author?.name || 'Unknown',
      recipientId: author?._id || '',
      itemTitle: item.title,
      itemId: item._id
    });
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price on request';
    return `${price.currency}${price.amount}`;
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

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h1>
              <p className="text-gray-600 mb-6">The marketplace item you're looking for doesn't exist or has been removed.</p>
              <Link href="/marketplace">
                <Button>Browse Marketplace</Button>
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
          <Link href="/marketplace" className="mr-4">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-white/80">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              <ShoppingBag className="h-3 w-3 mr-1" />
              Marketplace
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Item Images */}
            <Card>
              <CardContent className="p-0">
                <div className="h-64 bg-gradient-to-br from-pink-100 to-pink-200 rounded-t-lg flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-pink-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-pink-600">
                      {formatPrice(item.price)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.details?.condition && (
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">
                        Condition: {item.details.condition}
                      </Badge>
                      {item.details.brand && (
                        <Badge variant="outline">
                          {item.details.brand}
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
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </CardContent>
            </Card>

            {/* Item Details */}
            {item.details && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Item Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.details.category && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="text-gray-900">{item.details.category}</p>
                      </div>
                    )}
                    {item.details.condition && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Condition</label>
                        <p className="text-gray-900">{item.details.condition}</p>
                      </div>
                    )}
                    {item.details.brand && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Brand</label>
                        <p className="text-gray-900">{item.details.brand}</p>
                      </div>
                    )}
                    {item.details.model && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Model</label>
                        <p className="text-gray-900">{item.details.model}</p>
                      </div>
                    )}
                  </div>
                  
                  {item.details.features && item.details.features.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Features</label>
                      <div className="flex flex-wrap gap-2">
                        {item.details.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Seller */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">{(item.authorInfo || item.author)?.name}</p>
                    <p className="text-sm text-gray-500">Seller</p>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={handleContactSeller}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Seller
                </Button>
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
                  {item.location?.city}
                  {item.location?.state && `, ${item.location.state}`}
                  {item.location?.country && `, ${item.location.country}`}
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
                <p className="text-gray-700">{formatDate(item.createdAt)}</p>
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
          rideTitle={messagingModal.itemTitle}
          rideId={messagingModal.itemId}
        />
      </div>
    </div>
  );
}
