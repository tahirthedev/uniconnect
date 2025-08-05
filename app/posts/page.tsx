'use client';

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Search, MapPin, Filter } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import LocationFilter from "@/components/location-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiClient } from "@/lib/api";

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
  createdAt: string;
  distance?: number;
  distanceKm?: number;
}

export default function PostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [locationBased, setLocationBased] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceMin: '',
    priceMax: '',
  });
  const [locationFilter, setLocationFilter] = useState({
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
    radius: undefined as number | undefined,
    hasLocation: false
  });

  useEffect(() => {
    loadPosts();
  }, [filters, locationFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      
      // Add location parameters if available
      if (locationFilter.hasLocation && locationFilter.lat && locationFilter.lng) {
        params.lat = locationFilter.lat;
        params.lng = locationFilter.lng;
        params.radius = locationFilter.radius || 20;
      }
      
      // Add other filters
      if (filters.category) params.category = filters.category;
      if (filters.priceMin) params.priceMin = parseFloat(filters.priceMin);
      if (filters.priceMax) params.priceMax = parseFloat(filters.priceMax);
      
      const response = await apiClient.getPosts(params);
      setPosts(response.posts || []);
      setLocationBased(response.locationBased || false);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleLocationFilterChange = useCallback((newLocationFilter: any) => {
    setLocationFilter(newLocationFilter);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Browse Posts</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <p>All posts from the community</p>
              {locationBased && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Showing nearby results ({locationFilter.radius || 20}km radius)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div className="lg:col-span-1">
                <LocationFilter 
                  onFilterChange={handleLocationFilterChange}
                  defaultRadius={20}
                  compact={true}
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  <option value="pick-drop">Pick & Drop</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="jobs">Jobs</option>
                  <option value="buy-sell">Marketplace</option>
                  <option value="currency-exchange">Currency Exchange</option>
                </select>
              </div>
              
              {/* Price Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Min</label>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Max</label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading posts...</div>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No posts found</p>
                <p className="text-gray-400">Try adjusting your filters or expanding your search radius</p>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {post.category.replace('-', ' ')}
                      </Badge>
                      {post.distanceKm !== undefined && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs font-medium">{post.distanceKm}km away</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {post.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        📍 {post.location.city}
                        {post.location.state && `, ${post.location.state}`}
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
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          by {post.authorInfo?.name || 'Anonymous'}
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
    </div>
  );
}
