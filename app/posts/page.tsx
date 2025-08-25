'use client';

import { useState, useCallback } from "react";
import { ArrowLeft, MapPin, Calendar, User, Filter, MessageCircle, Car, Home, Briefcase, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import LocationFilter from "@/components/location-filter";
import MessagingModal from "@/components/messaging-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ApiClient } from "@/lib/api";
import { useLocationData, useLocation } from '@/contexts/LocationContext';
import { usePosts, usePostsWithFilters } from '@/contexts/PostsContext';
import { getPostUrl, isClickablePost, shouldShowContactButton } from '@/lib/post-utils';

const apiClient = new ApiClient();

interface Post {
  _id: string;
  title: string;
  description: string;
  category: string;
  price?: {
    amount: number;
    currency: string;
    type: string;
  };
  location: {
    city: string;
    state?: string;
    country: string;
  };
  authorInfo?: {
    name: string;
    email: string;
  };
  author?: {
    name: string;
    email: string;
  };
  images?: Array<string | { url: string; key?: string; filename?: string; contentType?: string; size?: number }>;
  createdAt: string;
  distance?: number;
  distanceKm?: number;
}

export default function PostsPage() {
  const router = useRouter();
  
  // Global location state
  const locationData = useLocationData();
  const { updateRadius } = useLocation();
  const { allPosts } = usePosts();
  
  // Use PostsContext with filters
  const [filters, setFilters] = useState({
    category: '',
    city: 'all',
  });
  
  const { posts, loading, error } = usePostsWithFilters({
    category: filters.category || undefined,
    city: filters.city === 'all' ? undefined : filters.city
  });
  
  // City name normalization functions (same as homepage)
  const normalizeCity = (city: string): string => {
    if (!city || typeof city !== 'string') return '';
    return city.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const extractCityFromPost = (post: any): string | null => {
    // Prioritize the city field
    if (post.location?.city) {
      const city = post.location.city.trim();
      // Ignore generic address descriptions
      if (city.length < 50 && !city.toLowerCase().includes('location in')) {
        return normalizeCity(city);
      }
    }
    
    // Fallback to address parsing only if city field is missing
    if (!post.location?.city && post.location?.address) {
      const address = post.location.address.trim();
      // Parse comma-separated address (e.g., "123 Street, London, UK")
      const parts = address.split(',').map((part: string) => part.trim());
      if (parts.length >= 2) {
        const potentialCity = parts[1]; // Usually the city is the second part
        if (potentialCity.length < 50 && !potentialCity.toLowerCase().includes('location in')) {
          return normalizeCity(potentialCity);
        }
      }
    }
    
    return null;
  };
  
  // Get available cities from ALL posts with normalization
  const availableCities = Array.from(new Set(
    allPosts
      .map(extractCityFromPost)
      .filter((city): city is string => city !== null && city.length > 0)
  )).sort();
  
  // Category configuration
  const categories = [
    { id: 'all', label: 'All Categories', icon: TrendingUp, color: 'bg-gray-500', enabled: true },
    { id: 'pick-drop', label: 'Rides', icon: Car, color: 'bg-blue-500', enabled: true },
    { id: 'accommodation', label: 'Housing', icon: Home, color: 'bg-green-500', enabled: true },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, color: 'bg-purple-500', enabled: true },
    { id: 'buy-sell', label: 'Marketplace', icon: ShoppingBag, color: 'bg-orange-500', enabled: true },
    { id: 'currency-exchange', label: 'Currency (Soon)', icon: DollarSign, color: 'bg-yellow-500', enabled: false },
  ];
  
  const [locationBased, setLocationBased] = useState(false);
  const [messagingModal, setMessagingModal] = useState<{
    isOpen: boolean;
    recipientName: string;
    recipientId: string;
    postTitle: string;
    postId: string;
  }>({
    isOpen: false,
    recipientName: '',
    recipientId: '',
    postTitle: '',
    postId: ''
  });

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    if (filters.category === categoryId) return;
    
    // Find the category to check if it's enabled
    const category = categories.find(cat => cat.id === categoryId);
    if (!category?.enabled) return; // Don't allow selection of disabled categories
    
    setFilters(prev => ({ ...prev, category: categoryId === 'all' ? '' : categoryId }));
  };

  const handleCityChange = (city: string) => {
    setFilters(prev => ({ ...prev, city }));
  };

  const handleLocationFilterChange = useCallback((newLocationFilter: any) => {
    // Only update radius if it has changed
    if (newLocationFilter.radius !== locationData.radius) {
      updateRadius(newLocationFilter.radius);
    }
  }, [locationData.radius, updateRadius]);

  const handlePostClick = (post: any) => {
    if (isClickablePost(post.category)) {
      const url = getPostUrl(post);
      router.push(url);
    } else if (shouldShowContactButton(post.category)) {
      // Open messaging modal for ridesharing posts
      setMessagingModal({
        isOpen: true,
        recipientName: post.authorInfo?.name || post.author?.name || 'Unknown',
        recipientId: post.authorInfo?._id || post.author?._id || post.user?._id || '',
        postTitle: post.title,
        postId: post._id
      });
    }
  };

  const handleContactPost = (post: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setMessagingModal({
      isOpen: true,
      recipientName: post.authorInfo?.name || post.author?.name || 'Unknown',
      recipientId: post.authorInfo?._id || post.author?._id || post.user?._id || '',
      postTitle: post.title,
      postId: post._id
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-500 mr-2 sm:mr-3" />
                Browse Posts
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Discover opportunities from the community</p>
            </div>
          </div>
          
          {locationBased && (
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Showing nearby results ({locationData.radius || 20}km radius)</span>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* Category Pills */}
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isActive = (category.id === 'all' && filters.category === '') || filters.category === category.id;
                  const isDisabled = !category.enabled;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      disabled={isDisabled}
                      className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-200 transform shadow-md ${
                        isDisabled
                          ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-60'
                          : isActive
                          ? 'bg-orange-500 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:text-orange-600 hover:scale-105 hover:shadow-lg'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Filter */}
            {availableCities.length > 0 && (
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Filter by City</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCityChange('all')}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 ${
                      filters.city === 'all'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Cities
                  </button>
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCityChange(city)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 ${
                        filters.city === city
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location Filter */}
            <div className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Location & Radius</h3>
              <LocationFilter 
                onFilterChange={handleLocationFilterChange}
                defaultRadius={locationData.radius || 20}
                compact={true}
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {filters.category === '' ? 'All Posts' : categories.find(c => c.id === filters.category)?.label}
              {filters.city !== 'all' ? ` in ${filters.city}` : ''}
            </h2>
            <p className="text-gray-600">
              Found <span className="font-semibold text-orange-600">{posts.length}</span> results
              {filters.city !== 'all' ? ` in ${filters.city}` : ''}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {posts.length === 0 ? (
              <div className="col-span-full">
                <Card className="text-center py-16 bg-white/50 border-dashed border-2 border-gray-200">
                  <CardContent className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Filter className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        Try adjusting your filters or expanding your search radius to see more results
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              posts.map((post) => (
                <Card 
                  key={post._id} 
                  className={`hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${
                    isClickablePost(post.category) ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handlePostClick(post)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={post.author?.name || 'User'} />
                          <AvatarFallback className="bg-orange-100 text-orange-600 text-sm">
                            {(post.author?.name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{post.author?.name || 'Anonymous'}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {post.category === 'ridesharing' || post.category === 'pick-drop' 
                          ? 'Pick & Drop' 
                          : post.category.replace('-', ' ')
                        }
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Post Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-4 -mx-6 -mt-3 relative">
                        <img
                          src={typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                        {post.images.length > 1 && (
                          <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                            +{post.images.length - 1} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.description}
                    </p>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {post.location.city}
                        {post.location.state && `, ${post.location.state}`}
                        {post.distanceKm !== undefined && (
                          <span className="ml-2 text-green-600 font-medium">
                            • {post.distanceKm}km away
                          </span>
                        )}
                      </div>
                      
                      {post.price && (
                        <div className="text-right">
                          <div className="font-semibold text-orange-600">
                            {post.price.currency} {post.price.amount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {post.price.type}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-3">
                      {isClickablePost(post.category) && (
                        <Button 
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePostClick(post);
                          }}
                        >
                          View Details
                        </Button>
                      )}
                      {shouldShowContactButton(post.category) && (
                        <Button 
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={(e) => handleContactPost(post, e)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          by {post.author?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={messagingModal.isOpen}
        onClose={() => setMessagingModal({ ...messagingModal, isOpen: false })}
        recipientName={messagingModal.recipientName}
        recipientId={messagingModal.recipientId}
        rideTitle={messagingModal.postTitle}
        rideId={messagingModal.postId}
      />
    </div>
  );
}
