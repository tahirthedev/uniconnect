'use client';

import { useState, useCallback } from "react";
import { ArrowLeft, MapPin, Calendar, User, Filter } from "lucide-react";
import Link from "next/link";
import LocationFilter from "@/components/location-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ApiClient } from "@/lib/api";
import { useLocationData, useLocation } from '@/contexts/LocationContext';
import { usePosts, usePostsWithFilters } from '@/contexts/PostsContext';

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
  createdAt: string;
  distance?: number;
  distanceKm?: number;
}

export default function PostsPage() {
  // Global location state
  const locationData = useLocationData();
  const { updateRadius } = useLocation();
  
  // Use PostsContext with filters
  const [filters, setFilters] = useState({
    category: '',
  });
  
  const { posts, loading, error } = usePostsWithFilters({
    category: filters.category || undefined
  });
  
  const [locationBased, setLocationBased] = useState(false);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleLocationFilterChange = useCallback((newLocationFilter: any) => {
    // Only update radius if it has changed
    if (newLocationFilter.radius !== locationData.radius) {
      updateRadius(newLocationFilter.radius);
    }
  }, [locationData.radius, updateRadius]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-white/80">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Browse Posts
              </h1>
              <p className="text-gray-600 mt-1">Discover opportunities from the community</p>
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
        <Card className="mb-8 border-0 shadow-md bg-white/80 backdrop-blur-sm overflow-visible">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-0 overflow-visible">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location & Radius</label>
                <LocationFilter 
                  onFilterChange={handleLocationFilterChange}
                  defaultRadius={locationData.radius || 20}
                  compact={true}
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={filters.category || ""} 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Categories</option>
                  <option value="pick-drop">Pick & Drop</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="jobs">Jobs</option>
                  <option value="buy-sell">Marketplace</option>
                  <option value="currency-exchange">Currency Exchange</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <Card key={post._id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
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
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.description}
                    </p>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center">
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
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
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
    </div>
  );
}
