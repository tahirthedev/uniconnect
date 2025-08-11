'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@/lib/api';
import { useLocationData } from './LocationContext';

const apiClient = new ApiClient();

// Utility function to calculate distance between two GPS coordinates (client-side only)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

interface Post {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price?: {
    amount: number;
    currency: string;
    type: string;
  };
  location: {
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    preferredMethod: string;
  };
  details?: any;
  status: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  likeCount?: number;
  isLiked?: boolean;
  distance?: number;
  distanceKm?: number;
}

interface PostsContextType {
  // Data
  allPosts: Post[];
  loading: boolean;
  lastFetch: number | null;
  error: string | null;

  // Actions
  refreshPosts: () => Promise<void>;
  getPostsByCategory: (category: string) => Post[];
  getPostsByLocation: (city?: string, radius?: number) => Post[];
  getPostsWithFilters: (filters: {
    category?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  }) => Post[];
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

interface PostsProviderProps {
  children: ReactNode;
}

export function PostsProvider({ children }: PostsProviderProps) {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get location data for GPS-based filtering
  const locationData = useLocationData();

  // Fetch all posts from API
  const refreshPosts = async () => {
    const now = Date.now();
    
    // Skip if recently fetched (within cache duration)
    if (lastFetch && now - lastFetch < CACHE_DURATION) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch all posts without category filter to get everything
      const response = await apiClient.getPosts({});
      
      setAllPosts(response.posts || []);
      setLastFetch(now);
      
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Initialize posts on mount
  useEffect(() => {
    refreshPosts();
  }, []);

  // Filter posts by category with location-based prioritization
  const getPostsByCategory = (category: string): Post[] => {
    if (!category) return allPosts;
    
    let categoryPosts;
    
    // Handle special cases
    if (category === 'pick-drop') {
      categoryPosts = allPosts.filter(post => 
        post.category === 'ridesharing' || post.category === 'pick-drop'
      );
    } else {
      categoryPosts = allPosts.filter(post => post.category === category);
    }
    
    // Apply GPS-based filtering and sorting if user has location
    if (locationData.lat && locationData.lng) {
      const userLat = locationData.lat;
      const userLng = locationData.lng;
      const radius = locationData.radius || 50;
      
      const postsWithDistance = categoryPosts
        .map(post => {
          if (post.location.coordinates && 
              post.location.coordinates.latitude && 
              post.location.coordinates.longitude) {
            const distance = calculateDistance(
              userLat, userLng,
              post.location.coordinates.latitude,
              post.location.coordinates.longitude
            );
            return { ...post, distance, distanceKm: distance };
          }
          // Don't include posts without valid coordinates in GPS filtering
          return null;
        })
        .filter((post): post is Post & { distance: number; distanceKm: number } => post !== null) // Remove posts without coordinates
        .filter(post => {
          // Only include posts within radius
          return post.distance <= radius;
        })
        .sort((a, b) => a.distance - b.distance);
      
      // Only use GPS filtering if it returns results, otherwise return all category posts
      return postsWithDistance.length > 0 ? postsWithDistance : categoryPosts;
    }
    
    return categoryPosts;
  };

  // Filter posts by location - GPS-based with fallback to city name
  const getPostsByLocation = (city?: string, radius: number = 50): Post[] => {
    // If user has GPS coordinates, prioritize proximity-based filtering
    if (locationData.lat && locationData.lng) {
      const userLat = locationData.lat;
      const userLng = locationData.lng;
      
      // Calculate distances and filter by radius
      const postsWithDistance = allPosts
        .map(post => {
          if (post.location.coordinates && 
              post.location.coordinates.latitude && 
              post.location.coordinates.longitude) {
            const distance = calculateDistance(
              userLat, userLng,
              post.location.coordinates.latitude,
              post.location.coordinates.longitude
            );
            return { ...post, distance, distanceKm: distance };
          }
          // Don't include posts without valid coordinates in GPS filtering
          return null;
        })
        .filter((post): post is Post & { distance: number; distanceKm: number } => post !== null) // Remove posts without coordinates
        .filter(post => {
          // Only include posts within radius
          return post.distance <= radius;
        })
        .sort((a, b) => a.distance - b.distance); // Sort by distance
      
      // If we have nearby posts, return them; otherwise fall back to city filtering or all posts
      if (postsWithDistance.length > 0) {
        return postsWithDistance;
      }
    }
    
    // Fallback: city name filtering (for when no GPS or no nearby posts)
    if (city) {
      return allPosts.filter(post => 
        post.location.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    // Last resort: return all posts
    return allPosts;
  };

  // Advanced filtering with GPS-based location prioritization
  const getPostsWithFilters = (filters: {
    category?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  }): Post[] => {
    let filtered = [...allPosts];

    // 1. GPS-based location filtering (if user has location and no specific city filter)
    if (!filters.city && locationData.lat && locationData.lng) {
      const userLat = locationData.lat;
      const userLng = locationData.lng;
      const radius = locationData.radius || 50; // Use user's radius or 50km default
      
      // Add distance calculations and filter by proximity
      const gpsFiltered = filtered
        .map(post => {
          if (post.location.coordinates && 
              post.location.coordinates.latitude && 
              post.location.coordinates.longitude) {
            const distance = calculateDistance(
              userLat, userLng,
              post.location.coordinates.latitude,
              post.location.coordinates.longitude
            );
            return { ...post, distance, distanceKm: distance };
          }
          // Don't include posts without valid coordinates in GPS filtering
          return null;
        })
        .filter((post): post is Post & { distance: number; distanceKm: number } => post !== null) // Remove posts without coordinates
        .filter(post => {
          // Only include posts within radius
          return post.distance <= radius;
        })
        .sort((a, b) => a.distance - b.distance);
      
      // Only use GPS filtering if it returns results, otherwise fall back to all posts
      if (gpsFiltered.length > 0) {
        filtered = gpsFiltered;
      }
      // If no GPS results, continue with all posts (no filtering applied)
    }

    // 2. Category filter
    if (filters.category) {
      filtered = filtered.filter(post => post.category === filters.category);
    }

    // 3. City name filter (overrides GPS if specified)
    if (filters.city) {
      filtered = filtered.filter(post =>
        post.location.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Price filter
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      filtered = filtered.filter(post => {
        if (!post.price?.amount) return false;
        
        const price = post.price.amount;
        const minOk = filters.priceMin === undefined || price >= filters.priceMin;
        const maxOk = filters.priceMax === undefined || price <= filters.priceMax;
        
        return minOk && maxOk;
      });
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.description.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  // Add new post to local cache
  const addPost = (post: Post) => {
    setAllPosts(prev => [post, ...prev]);
  };

  // Update post in local cache
  const updatePost = (postId: string, updates: Partial<Post>) => {
    setAllPosts(prev =>
      prev.map(post =>
        post._id === postId ? { ...post, ...updates } : post
      )
    );
  };

  // Delete post from local cache
  const deletePost = (postId: string) => {
    setAllPosts(prev => prev.filter(post => post._id !== postId));
  };

  const value: PostsContextType = {
    // Data
    allPosts,
    loading,
    lastFetch,
    error,

    // Actions
    refreshPosts,
    getPostsByCategory,
    getPostsByLocation,
    getPostsWithFilters,
    addPost,
    updatePost,
    deletePost,
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

// Custom hook to use posts context
export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}

// Convenience hooks for common use cases
export function usePostsByCategory(category: string) {
  const { getPostsByCategory, loading, error } = usePosts();
  return {
    posts: getPostsByCategory(category),
    loading,
    error
  };
}

export function usePostsWithFilters(filters: {
  category?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
}) {
  const { getPostsWithFilters, loading, error } = usePosts();
  return {
    posts: getPostsWithFilters(filters),
    loading,
    error
  };
}
