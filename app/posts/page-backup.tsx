'use client';

import { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";

interface Post {
  _id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  location: string;
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Sample UK posts data
  const samplePosts = [
    {
      _id: '1',
      title: 'MacBook Pro M3 - Like New',
      description: 'Selling my MacBook Pro M3 in excellent condition. Barely used, comes with original box and charger.',
      category: 'marketplace',
      price: 1200,
      location: 'Manchester',
      user: { name: 'James Wilson', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Part-time React Developer',
      description: 'Looking for a part-time React developer to work on a student project. Remote work possible.',
      category: 'jobs',
      price: 18,
      location: 'Birmingham',
      user: { name: 'Sarah Chen', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      title: 'Central London to UCL Campus',
      description: 'Daily commute with space for 3 passengers',
      category: 'ridesharing',
      price: 8,
      location: 'London',
      user: { name: 'Emma Johnson', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    },
    {
      _id: '4',
      title: 'Shared Flat Near University',
      description: 'Looking for a flatmate to share a 2-bedroom apartment near the university. Fully furnished.',
      category: 'accommodation',
      price: 450,
      location: 'Edinburgh',
      user: { name: 'Alex McKenzie', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Read URL parameters on client side
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q') || '';
    const location = urlParams.get('location') || '';
    
    setSearchQuery(q);
    setLocationFilter(location);
    
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Re-filter when search/filter values change
      fetchPosts();
    }
  }, [searchQuery, locationFilter, categoryFilter]);

  const fetchPosts = async () => {
    try {
      // Try to fetch from backend, fallback to sample data
      const response = await apiClient.getPosts();
      const postsData = response.posts || [];
      
      if (postsData.length === 0) {
        // Use sample data if no backend data
        setPosts(samplePosts);
      } else {
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to sample data
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      post.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCategory = !categoryFilter || post.category === categoryFilter;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'ridesharing', label: 'Ridesharing' },
    { value: 'pick-drop', label: 'Pick & Drop' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'marketplace', label: 'Buy/Sell' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'currency', label: 'Currency Exchange' }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      ridesharing: 'bg-blue-100 text-blue-800',
      'pick-drop': 'bg-green-100 text-green-800',
      jobs: 'bg-purple-100 text-purple-800',
      marketplace: 'bg-orange-100 text-orange-800',
      accommodation: 'bg-pink-100 text-pink-800',
      currency: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price?: number, category?: string) => {
    if (!price) return '';
    
    if (category === 'jobs') return `£${price}/hr`;
    if (category === 'accommodation') return `£${price}/month`;
    return `£${price}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering happens automatically via useEffect
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Posts</h1>
            <p className="text-gray-600">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All posts from the community'}
              {locationFilter && ` in ${locationFilter}`}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search posts..."
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
                <input
                  type="text"
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
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
                Showing {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
              </div>
              {filteredPosts.map((post) => (
                <Card key={post._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getCategoryColor(post.category)}>
                            {post.category.replace('-', ' ')}
                          </Badge>
                          {post.price && (
                            <span className="text-lg font-bold text-orange-600">
                              {formatPrice(post.price, post.category)}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-700 mb-3">{post.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <img
                              src={post.user.avatar || '/placeholder-user.jpg'}
                              alt={post.user.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            {post.user.name}
                          </div>
                          <span>•</span>
                          <span>{post.location}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <Link href={`/${post.category}`}>
                          <Button variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
