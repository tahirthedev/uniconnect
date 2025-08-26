'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Home, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Heart,
  Share2,
  MessageCircle,
  Star,
  Bed,
  Bath,
  Wifi,
  Car,
  Shield,
  Clock,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  X,
  Info,
  MapIcon,
  Train,
  Bus,
  Building2,
  GraduationCap,
  Coffee,
  ShoppingBag,
  Utensils,
  Dumbbell
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import MessagingModal from '@/components/messaging-modal';

interface PropertyDetails {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    type: string;
    currency: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: [number, number];
  };
  details: {
    accommodation: {
      type: string;
      bedrooms: number;
      bathrooms: number;
      capacity: number;
      size: number;
      amenities: string[];
      rating?: number;
    };
  };
  metadata: any;
  images: Array<{ url: string; alt?: string }>;
  author: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  createdAt: string;
  distance?: {
    km: number;
    calculated: boolean;
    note?: string;
  };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPost(propertyId);
      if (response && response.post) {
        // Transform images to ensure consistent format
        const transformedPost = {
          ...response.post,
          images: response.post.images && response.post.images.length > 0 
            ? response.post.images.map((img: any) => ({
                url: typeof img === 'string' ? img : img.url,
                alt: typeof img === 'object' ? img.filename : undefined
              }))
            : []
        };
        setProperty(transformedPost);
      } else {
        setError('Property not found');
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to contact property owners');
      router.push('/auth');
      return;
    }
    setShowMessagingModal(true);
  };

  const handleBookViewing = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to book a viewing');
      router.push('/auth');
      return;
    }
    // Open messaging modal with pre-filled viewing request
    setShowMessagingModal(true);
  };

  const toggleFavorite = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to save properties');
      router.push('/auth');
      return;
    }
    setIsFavorited(!isFavorited);
    // You can implement actual favorite functionality here
  };

  const formatPrice = (price: any) => {
    if (!price || !price.amount) return 'Contact for price';
    return `£${price.amount}/${price.type === 'monthly' ? 'month' : price.type === 'weekly' ? 'week' : 'night'}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      wifi: Wifi,
      parking: Car,
      kitchen_full: Utensils,
      kitchen_shared: Utensils,
      desk: Building2,
      ac: Info,
      secure_entry: Shield,
      gym: Dumbbell,
    };
    const IconComponent = iconMap[amenity] || Check;
    return <IconComponent className="h-4 w-4" />;
  };

  const getAmenityLabel = (amenity: string) => {
    const labelMap: { [key: string]: string } = {
      wifi: 'WiFi',
      parking: 'Parking',
      kitchen_full: 'Full Kitchen',
      kitchen_shared: 'Shared Kitchen',
      desk: 'Study Desk',
      ac: 'Air Conditioning',
      secure_entry: 'Secure Entry',
      gym: 'Gym Access',
    };
    return labelMap[amenity] || amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || 'Property not found'}
              </h3>
              <p className="text-gray-600 mb-4">
                The property you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/accommodation">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Back to Listings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <Link href="/accommodation" className="mr-4">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Listings
            </Button>
          </Link>
        </div>

        {/* Image Gallery */}
        <div className="relative mb-8">
          {property.images && property.images.length > 0 ? (
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
                <img
                  src={property.images[currentImageIndex]?.url}
                  alt={property.images[currentImageIndex]?.alt || property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {property.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/80 hover:bg-white"
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/80 hover:bg-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {property.images.length > 1 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => setShowFullGallery(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Thumbnail Row */}
              {property.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        index === currentImageIndex 
                          ? 'border-orange-500 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 md:h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
              <Home className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                {property.details?.accommodation?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{property.details.accommodation.rating}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location?.address || `${property.location?.city}, ${property.location?.state}`}</span>
                {property.distance && (
                  <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                    {property.distance.km}km away
                  </span>
                )}
              </div>

              {/* Property Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                {property.details?.accommodation?.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{property.details.accommodation.bedrooms} bed{property.details.accommodation.bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {property.details?.accommodation?.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.details.accommodation.bathrooms} bath{property.details.accommodation.bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {property.details?.accommodation?.capacity && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Up to {property.details.accommodation.capacity} people</span>
                  </div>
                )}
                {property.details?.accommodation?.size && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{property.details.accommodation.size}m²</span>
                  </div>
                )}
              </div>

              {property.details?.accommodation?.type && (
                <Badge variant="secondary" className="mt-2">
                  {property.details.accommodation.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About this property</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.details?.accommodation?.amenities && property.details.accommodation.amenities.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.details.accommodation.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getAmenityIcon(amenity)}
                        <span>{getAmenityLabel(amenity)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Details from Metadata */}
            {property.metadata && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {property.metadata.availability && (
                      <div>
                        <span className="font-medium text-gray-900">Available from:</span>
                        <p className="text-gray-600">{formatDate(property.metadata.availability.from)}</p>
                      </div>
                    )}
                    {property.metadata.tenure && (
                      <div>
                        <span className="font-medium text-gray-900">Tenure:</span>
                        <p className="text-gray-600">{property.metadata.tenure}</p>
                      </div>
                    )}
                    {property.metadata.pricing?.deposit && (
                      <div>
                        <span className="font-medium text-gray-900">Deposit:</span>
                        <p className="text-gray-600">£{property.metadata.pricing.deposit}</p>
                      </div>
                    )}
                    {property.metadata.preferences?.ageRange && (
                      <div>
                        <span className="font-medium text-gray-900">Age Range:</span>
                        <p className="text-gray-600">
                          {property.metadata.preferences.ageRange.min}-{property.metadata.preferences.ageRange.max} years
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* House Rules */}
            {property.metadata?.preferences && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">House Rules & Preferences</h2>
                  <div className="space-y-3 text-sm">
                    {property.metadata.preferences.pets && (
                      <div className="flex items-center gap-2">
                        {property.metadata.preferences.pets.allowed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>Pets {property.metadata.preferences.pets.allowed ? 'allowed' : 'not allowed'}</span>
                      </div>
                    )}
                    {property.metadata.preferences.lifestyle && (
                      <>
                        <div className="flex items-center gap-2">
                          {property.metadata.preferences.lifestyle.smoking ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span>Smoking {property.metadata.preferences.lifestyle.smoking ? 'allowed' : 'not allowed'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {property.metadata.preferences.lifestyle.parties ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span>Parties {property.metadata.preferences.lifestyle.parties ? 'allowed' : 'not allowed'}</span>
                        </div>
                        {property.metadata.preferences.lifestyle.quietHours && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>Quiet hours enforced</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Price and Contact */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {formatPrice(property.price)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Posted {formatDate(property.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={handleContactOwner}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Owner
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleBookViewing}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Viewing
                    </Button>

                    {property.author?.phone && (
                      <Button variant="outline" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Property Owner */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Property Owner</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={property.author?.avatar || '/placeholder-user.jpg'}
                      alt={property.author?.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{property.author?.name}</p>
                      <p className="text-sm text-gray-600">Landlord</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Facts */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quick Facts</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-medium">
                        {property.details?.accommodation?.type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Accommodation'}
                      </span>
                    </div>
                    {property.details?.accommodation?.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{property.details.accommodation.size}m²</span>
                      </div>
                    )}
                    {property.metadata?.pricing?.utilitiesIncluded !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilities:</span>
                        <span className="font-medium">
                          {property.metadata.pricing.utilitiesIncluded ? 'Included' : 'Not Included'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      {property && (
        <MessagingModal
          isOpen={showMessagingModal}
          onClose={() => setShowMessagingModal(false)}
          recipientName={property.author?.name || 'Property Owner'}
          rideTitle={property.title}
          recipientId={property.author?._id}
          rideId={property._id}
        />
      )}
    </div>
  );
}
