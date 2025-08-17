'use client';

import { useState, useCallback, useMemo, useEffect } from "react";
import { ArrowLeft, Search, Grid, List, Heart, Share, Star, MapPin, Clock, Eye, ShoppingBag, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LocationFilter from "@/components/location-filter";
import { useLocationData, useLocation } from '@/contexts/LocationContext';
import { usePostsByCategory, usePosts } from '@/contexts/PostsContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import MessagingModal from '@/components/messaging-modal';

export default function MarketplacePage() {
  // Global location state
  const locationData = useLocationData();
  const { updateRadius } = useLocation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // Use PostsContext for marketplace posts
  const { posts: marketplacePosts, loading, error } = usePostsByCategory('buy-sell');
  const { updatePost, forceRefreshPosts } = usePosts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Messaging modal state
  const [messagingModal, setMessagingModal] = useState({
    isOpen: false,
    recipientName: '',
    recipientId: '',
    itemTitle: '',
    itemId: ''
  });

  // Handle success parameter from URL
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      // Force refresh posts to show the newly created item
      forceRefreshPosts();
      
      // Show success message
      toast({
        title: "Item listed successfully! 🎉",
        description: "Your item is now visible in the marketplace.",
      });
      
      // Remove success parameter from URL without causing navigation
      window.history.replaceState({}, '', '/marketplace');
    }
  }, [searchParams, forceRefreshPosts, toast]);

  // Transform posts into products format
  const products = useMemo(() => {
    return marketplacePosts.map(post => ({
      id: post._id,
      title: post.title,
      price: post.price ? `£${post.price.amount}` : 'Contact for price',
      originalPrice: post.details?.marketplace?.originalPrice ? `£${post.details.marketplace.originalPrice}` : undefined,
      seller: post.author.name,
      rating: 4.8, // Default rating
      location: post.location.city,
      posted: new Date(post.createdAt).toLocaleDateString(),
      images: ["/placeholder.svg?height=300&width=400"],
      condition: post.details?.marketplace?.condition || 'Good',
      category: post.details?.marketplace?.category || 'General',
      description: post.description,
      verified: true,
      featured: !!(post.likeCount && post.likeCount > 10) // Convert to boolean
    }));
  }, [marketplacePosts]);

  // Get available cities from marketplace posts
  const availableCities = useMemo(() => {
    const cities = marketplacePosts.map(post => post.location?.city).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [marketplacePosts]);

  const handleLocationFilterChange = useCallback((data: any) => {
    // Only update radius if it has changed
    if (data.radius !== locationData.radius) {
      updateRadius(data.radius);
    }
    
    // In a real app, you would filter products based on location here
    if (data?.location) {
      setLocationFilter(data.location);
    }
  }, [locationData.radius, updateRadius]);

  // Handle contact seller
  const handleContactSeller = useCallback((product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the original post to get the author ID
    const originalPost = marketplacePosts.find(post => post._id === product.id);
    if (!originalPost) {
      toast({
        title: "Error",
        description: "Unable to contact seller. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setMessagingModal({
      isOpen: true,
      recipientName: product.seller,
      recipientId: originalPost.author._id,
      itemTitle: product.title,
      itemId: product.id
    });
  }, [marketplacePosts, toast]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      product.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCity = selectedCity === 'all' || product.location === selectedCity;
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesCondition = !conditionFilter || product.condition === conditionFilter;
    
    return matchesSearch && matchesLocation && matchesCity && matchesCategory && matchesCondition;
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Books', label: 'Books' },
    { value: 'Sports', label: 'Sports & Fitness' }
  ];

  const conditions = [
    { value: '', label: 'Any Condition' },
    { value: 'Like New', label: 'Like New' },
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' }
  ];

  const getConditionColor = (condition: string) => {
    const colors = {
      'Like New': 'bg-green-100 text-green-800',
      'Excellent': 'bg-blue-100 text-blue-800',
      'Good': 'bg-yellow-100 text-yellow-800',
      'Fair': 'bg-orange-100 text-orange-800'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading marketplace...</div>
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
                <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-500 mr-2 sm:mr-3" />
                Marketplace
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Buy and sell items in your university community</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Link href="/marketplace/sell">
              <Button className="bg-orange-500 hover:bg-orange-600 text-sm sm:text-base px-4 sm:px-6">
                Sell Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
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
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>
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
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
                <Link href="/">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Showing {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
              </div>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/marketplace/${product.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          {product.featured && (
                            <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                              Featured
                            </Badge>
                          )}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button 
                              className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Heart className="h-4 w-4 text-gray-600" />
                            </button>
                            <button 
                              className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Share className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getConditionColor(product.condition)}>
                              {product.condition}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl font-bold text-orange-600">{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              {product.rating}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.location}
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t">
                            <Button 
                              className="w-full bg-orange-500 hover:bg-orange-600"
                              onClick={(e) => handleContactSeller(product, e)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contact Seller
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/marketplace/${product.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.title}</h3>
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge className={getConditionColor(product.condition)}>
                                    {product.condition}
                                  </Badge>
                                  {product.featured && (
                                    <Badge className="bg-orange-500 text-white">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-2xl font-bold text-orange-600">{product.price}</span>
                                  {product.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                                  )}
                                  </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                {product.rating} • {product.seller}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {product.location}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {product.posted}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                className="bg-orange-500 hover:bg-orange-600"
                                onClick={(e) => handleContactSeller(product, e)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contact Seller
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Heart className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
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
  );
}
