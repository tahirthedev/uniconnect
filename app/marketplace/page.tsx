'use client';

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Search, Grid, List, Heart, Share, Star, MapPin, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LocationFilter from "@/components/location-filter";
import { useLocationData, useLocation } from '@/contexts/LocationContext';

export default function MarketplacePage() {
  // Global location state
  const locationData = useLocationData();
  const { updateRadius } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleLocationFilterChange = useCallback((data: any) => {
    console.log('📍 Marketplace location filter change requested:', {
      new: data,
      timestamp: new Date().toISOString()
    });
    
    // Only update radius if it has changed
    if (data.radius !== locationData.radius) {
      updateRadius(data.radius);
    }
    
    // In a real app, you would filter products based on location here
    if (data?.location) {
      setLocationFilter(data.location);
    }
  }, [locationData.radius, updateRadius]);

  const products = [
    {
      id: 1,
      title: "MacBook Pro M3 14-inch - Like New",
      price: "£1,200",
      originalPrice: "£1,599",
      seller: "Mike Chen",
      rating: 4.9,
      location: "London",
      posted: "2 hours ago",
      images: ["/placeholder.svg?height=300&width=400"],
      condition: "Like New",
      category: "Electronics",
      views: 45,
      likes: 12,
      featured: true,
    },
    {
      id: 2,
      title: "Vintage Leather Jacket - Size M",
      price: "£65",
      seller: "Sarah Johnson",
      rating: 4.8,
      location: "Manchester",
      posted: "5 hours ago",
      images: ["/placeholder.svg?height=300&width=400"],
      condition: "Good",
      category: "Fashion",
      views: 23,
      likes: 8,
    },
    {
      id: 3,
      title: "Study Desk with Drawers",
      price: "£80",
      seller: "Emma Wilson",
      rating: 5.0,
      location: "Birmingham",
      posted: "1 day ago",
      images: ["/placeholder.svg?height=300&width=400"],
      condition: "Excellent",
      category: "Furniture",
      views: 67,
      likes: 15,
    },
    {
      id: 4,
      title: "iPhone 14 Pro - 256GB Space Black",
      price: "£750",
      originalPrice: "£999",
      seller: "Alex McKenzie",
      rating: 4.9,
      location: "Edinburgh",
      posted: "2 days ago",
      images: ["/placeholder.svg?height=300&width=400"],
      condition: "Like New",
      category: "Electronics",
      views: 89,
      likes: 24,
      featured: true,
    },
    {
      id: 5,
      title: "Textbooks Bundle - Computer Science",
      price: "£120",
      originalPrice: "£280",
      seller: "Tom Wilson",
      rating: 4.7,
      location: "Bristol",
      posted: "3 days ago",
      images: ["/placeholder.svg?height=300&width=400"],
      condition: "Good",
      category: "Books",
      views: 34,
      likes: 9,
    },
    {
      id: 6,
      title: "Gaming Chair - Ergonomic",
      price: "£180",
      seller: "Lisa Brown",
      rating: 4.8,
      location: "Leeds",
      posted: "1 week ago",
      images: ["/placeholder.svg?height=300&width=400"],
      condition: "Excellent",
      category: "Furniture",
      views: 56,
      likes: 18,
    }
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      product.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesCondition = !conditionFilter || product.condition === conditionFilter;
    
    return matchesSearch && matchesLocation && matchesCategory && matchesCondition;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600">Buy and sell items in your university community</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
            <Button className="bg-orange-500 hover:bg-orange-600">
              Sell Item
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
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
                            <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                              <Heart className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                              <Share className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getConditionColor(product.condition)}>
                              {product.condition}
                            </Badge>
                            <div className="flex items-center text-xs text-gray-500">
                              <Eye className="h-3 w-3 mr-1" />
                              {product.views}
                            </div>
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
                            <Button className="w-full bg-orange-500 hover:bg-orange-600">
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
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
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
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {product.views} views
                                  </div>
                                  <div className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {product.likes}
                                  </div>
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
                              <Button className="bg-orange-500 hover:bg-orange-600">
                                Contact Seller
                              </Button>
                              <Button variant="outline">
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
    </div>
  );
}
