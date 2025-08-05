'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
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
  Star,
  Bed,
  Bath,
  Wifi,
  Car
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import LocationFilter from '@/components/location-filter';

export default function AccommodationPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationData, setLocationData] = useState<any>(null);
  const [filters, setFilters] = useState({
    priceRange: 'all',
    accommodationType: 'all',
    location: 'all'
  });

  const fetchAccommodationPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build API parameters
      const params: any = { category: 'accommodation' };
      
      // Add location parameters if location data is available
      if (locationData?.lat && locationData?.lng) {
        params.lat = locationData.lat;
        params.lng = locationData.lng;
        params.radius = locationData.radius || 20; // Default 20km radius
      }
      
      const response = await apiClient.getPosts(params);
      
      if (response && response.posts) {
        setPosts(response.posts);
      }
    } catch (error) {
      console.error('Error fetching accommodation posts:', error);
    } finally {
      setLoading(false);
    }
  }, [locationData?.lat, locationData?.lng, locationData?.radius]); // Add dependencies

  useEffect(() => {
    fetchAccommodationPosts();
  }, [fetchAccommodationPosts]); // ✅ Depend on the memoized function

  const handleLocationFilterChange = useCallback((data: any) => {
    setLocationData(data);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchTerm);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="h-8 w-8 text-orange-600" />
              Student Accommodation
            </h1>
            <p className="text-gray-600 mt-2">Find your perfect home away from home</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            List Your Property
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Location Filter */}
          <div className="lg:col-span-1">
            <LocationFilter
              onFilterChange={handleLocationFilterChange}
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

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {posts.length} accommodation{posts.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accommodations found</h3>
              <p className="text-gray-500 mb-4">Be the first to list your property!</p>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                List Your Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    <Button size="sm" variant="secondary" className="bg-white/80">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/80">
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
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Posted {formatDate(post.createdAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
