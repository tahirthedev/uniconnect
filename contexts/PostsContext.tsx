'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@/lib/api';

const apiClient = new ApiClient();

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

  // Filter posts by category
  const getPostsByCategory = (category: string): Post[] => {
    if (!category) return allPosts;
    
    // Handle special cases
    if (category === 'pick-drop') {
      return allPosts.filter(post => 
        post.category === 'ridesharing' || post.category === 'pick-drop'
      );
    }
    
    return allPosts.filter(post => post.category === category);
  };

  // Filter posts by location
  const getPostsByLocation = (city?: string, radius?: number): Post[] => {
    if (!city) return allPosts;
    
    return allPosts.filter(post => 
      post.location.city.toLowerCase().includes(city.toLowerCase())
    );
  };

  // Advanced filtering
  const getPostsWithFilters = (filters: {
    category?: string;
    city?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  }): Post[] => {
    let filtered = [...allPosts];

    // Category filter
    if (filters.category) {
      filtered = getPostsByCategory(filters.category);
    }

    // Location filter
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
