'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Search,
  Filter,
  Plus,
  Heart,
  Share2,
  MessageCircle,
  ArrowLeft,
  Star,
  Bed,
  Bath,
  Wifi,
  Car
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import LocationFilter from '@/components/location-filter';
import MessagingModal from '@/components/messaging-modal';
import { useLocationData, useLocation } from '@/contexts/LocationContext';
import { usePostsByCategory, usePosts } from '@/contexts/PostsContext';

export default function AccommodationPage() {
  // Global location state
  const locationData = useLocationData();
  const { updateRadius } = useLocation();
  const router = useRouter();
  
  // Use PostsContext for accommodation posts
  const { posts: accommodationPosts, loading, error } = usePostsByCategory('accommodation');
  const { updatePost, allPosts } = usePosts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInfo, setLocationInfo] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('all');
  const [filters, setFilters] = useState({
    priceRange: 'all',
    accommodationType: 'all',
    location: 'all'
  });

  // Transform posts into accommodation format
  const posts = useMemo(() => {
    return accommodationPosts.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      price: post.price,
      location: post.location,
      details: post.details,
      author: post.author,
      contact: post.contact,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      views: post.views,
      likeCount: post.likeCount,
      isLiked: post.isLiked,
      distance: post.distance,
      distanceKm: post.distanceKm
    }));
  }, [accommodationPosts]);

  // Get available cities from accommodation posts
  const availableCities = useMemo(() => {
    const cities = accommodationPosts.map(post => post.location?.city).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [accommodationPosts]);

  // Filter posts based on city selection and other filters
  const filteredPosts = useMemo(() => {
    return posts.filter((post: any) => {
      // City filter
      const matchesCity = selectedCity === 'all' || 
        (post.location && post.location.city === selectedCity);

      // Search term filter
      const matchesSearch = !searchTerm || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.location && post.location.city && post.location.city.toLowerCase().includes(searchTerm.toLowerCase()));

      // Price range filter
      const matchesPrice = filters.priceRange === 'all' || (() => {
        if (!post.price) return false;
        const price = parseFloat(post.price);
        switch (filters.priceRange) {
          case '0-300': return price <= 300;
          case '300-500': return price > 300 && price <= 500;
          case '500-800': return price > 500 && price <= 800;
          case '800+': return price > 800;
          default: return true;
        }
      })();

      // Accommodation type filter
      const matchesType = filters.accommodationType === 'all' || 
        (post.details?.accommodation?.type === filters.accommodationType);

      return matchesCity && matchesSearch && matchesPrice && matchesType;
    });
  }, [posts, selectedCity, searchTerm, filters]);

  const handleLocationFilterChange = useCallback((data: any) => {
    // Only update radius if it has changed and is a valid number
    if (data.radius !== undefined && data.radius !== locationData.radius) {
      updateRadius(data.radius);
    }
  }, [locationData.radius, updateRadius]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const formatPrice = (price: any) => {
    if (!price || !price.amount) return 'Contact for price';
    return `£${price.amount}/${price.type === 'monthly' ? 'month' : price.type === 'weekly' ? 'week' : 'night'}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleContactOwner = (post: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to contact property owners');
      window.location.href = '/auth';
      return;
    }
    
    setSelectedPost(post);
    setShowMessagingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-4">
          <div className="flex items-center">
            <Link href="/" className="mr-3 sm:mr-4">
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 hover:text-orange-600" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <Home className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-500 mr-2 sm:mr-3" />
                Student Accommodation
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Find your perfect home away from home</p>
            </div>
          </div>
          <Link href="/accommodation/list">
            <Button className="bg-orange-500 hover:bg-orange-600 text-sm sm:text-base px-4 sm:px-6">
              <Plus className="h-4 w-4 mr-2" />
              List Your Property
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Location Filter */}
          <div className="lg:col-span-1">
            <LocationFilter
              onFilterChange={handleLocationFilterChange}
              defaultRadius={locationData.radius || 20}
              compact={true}
            />
          </div>

          {/* Search and Other Filters */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by keywords, university, or property features..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                      Search
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <select
                      value={filters.priceRange}
                      onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Prices</option>
                      <option value="0-300">£0 - £300/month</option>
                      <option value="300-500">£300 - £500/month</option>
                      <option value="500-800">£500 - £800/month</option>
                      <option value="800+">£800+/month</option>
                    </select>
                    
                    <select
                      value={filters.accommodationType}
                      onChange={(e) => setFilters({...filters, accommodationType: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Types</option>
                      <option value="room">Single Room</option>
                      <option value="flat">Flat/Apartment</option>
                      <option value="house">House</option>
                      <option value="studio">Studio</option>
                    </select>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* City Filter */}
        {availableCities.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by City</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity('all')}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 ${
                      selectedCity === 'all'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Cities
                  </button>
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 ${
                        selectedCity === city
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredPosts.length} accommodation{filteredPosts.length !== 1 ? 's' : ''} available
              {locationInfo && locationInfo.searchArea && (
                <span className="text-sm text-gray-500 ml-2">
                  {locationInfo.searchArea.foundCity && ` in ${locationInfo.searchArea.foundCity}`}
                  {locationInfo.searchArea.nearbyCities && locationInfo.searchArea.nearbyCities.length > 0 && 
                    ` and nearby areas`}
                </span>
              )}
            </p>
            
            {/* Location Quality Indicator */}
            {locationInfo && locationInfo.fallbacksUsed && locationInfo.fallbacksUsed.length > 0 && (
              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                {locationInfo.fallbacksUsed.includes('gps_and_cities') && '📍 Location-based'}
                {locationInfo.fallbacksUsed.includes('city_based') && '🏙️ City-based'}
                {locationInfo.fallbacksUsed.includes('show_all') && '🌍 All UK'}
              </div>
            )}
          </div>
          
          {/* Distance info for posts */}
          {filteredPosts.length > 0 && locationInfo?.userLocation && (
            <p className="text-xs text-gray-500 mt-1">
              Sorted by distance from your location
            </p>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accommodations found</h3>
              
              {/* Show smart suggestions from backend */}
              {suggestions.length > 0 ? (
                <div className="mb-6">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="mb-3">
                      <p className="text-gray-600 text-sm mb-2">{suggestion.message}</p>
                      {suggestion.type === 'popular_cities' && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'].map(city => (
                            <Button
                              key={city}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // You can implement city selection here
                              }}
                              className="text-xs"
                            >
                              {city}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-4">Be the first to list your property!</p>
              )}
              
              <Link href="/accommodation/list">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  List Your Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPosts.map((post: any) => (
              <Card key={post._id} className="overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group">
                <div 
                  onClick={() => router.push(`/accommodation/${post._id}`)}
                  className="block group-hover:scale-[1.02] transition-transform duration-200"
                >
                  <div className="relative">
                    {post.images && post.images.length > 0 ? (
                      <img
                        src={post.images[0].url}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle favorite functionality
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle share functionality
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
                      {post.details?.accommodation?.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{post.details.accommodation.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{post.location?.city}, {post.location?.state}</span>
                      {post.distance && (
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                          {post.distance.km}km away
                          {!post.distance.calculated && (
                            <span className="text-gray-400 ml-1" title={post.distance.note}>*</span>
                          )}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
                    
                    {post.details?.accommodation && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {post.details.accommodation.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{post.details.accommodation.bedrooms}</span>
                          </div>
                        )}
                        {post.details.accommodation.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{post.details.accommodation.bathrooms}</span>
                          </div>
                        )}
                        {post.details.accommodation.amenities?.includes('wifi') && (
                          <Wifi className="h-4 w-4" />
                        )}
                        {post.details.accommodation.amenities?.includes('parking') && (
                          <Car className="h-4 w-4" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg text-orange-600">
                          {formatPrice(post.price)}
                        </span>
                        {post.details?.accommodation?.type && (
                          <Badge variant="secondary" className="ml-2">
                            {post.details.accommodation.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Posted {formatDate(post.createdAt)}
                    </div>
                  </CardContent>
                </div>
                
                {/* Contact Button - Outside clickable area */}
                <div className="px-4 pb-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/accommodation/${post._id}`);
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactOwner(post);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Messaging Modal */}
      {selectedPost && (
        <MessagingModal
          isOpen={showMessagingModal}
          onClose={() => setShowMessagingModal(false)}
          recipientName={selectedPost.author?.name || 'Property Owner'}
          rideTitle={selectedPost.title}
          recipientId={selectedPost.author?._id || selectedPost.author}
          rideId={selectedPost._id}
        />
      )}
    </div>
  );
}