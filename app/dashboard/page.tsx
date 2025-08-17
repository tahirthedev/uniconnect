'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { usePosts } from '@/contexts/PostsContext'
import { 
  User, 
  MapPin, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  Settings,
  Home,
  Car,
  Briefcase,
  ShoppingBag,
  DollarSign,
  MessageCircle,
  AlertCircle
} from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

interface Post {
  _id: string
  title: string
  description: string
  category: string
  location: {
    city: string
    state: string
  }
  price?: {
    amount: number
    currency: string
  }
  status: string
  createdAt: string
  views: number
  likes: string[]
}

interface UserStats {
  totalPosts: number
  activePosts: number
  totalViews: number
  totalLikes: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { deletePost: deletePostFromContext } = usePosts()

  const categoryIcons = {
    'pick-drop': Car,
    'accommodation': Home,
    'jobs': Briefcase,
    'buy-sell': ShoppingBag,
    'currency-exchange': DollarSign,
  }

  const categoryColors = {
    'pick-drop': 'bg-blue-500',
    'accommodation': 'bg-green-500',
    'jobs': 'bg-purple-500',
    'buy-sell': 'bg-pink-500',
    'currency-exchange': 'bg-yellow-500',
  }

  useEffect(() => {
    checkAuth()
    fetchUserPosts()
    fetchUserStats()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }

      const userData = await apiClient.getCurrentUser()
      setUser(userData.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth')
    }
  }

  const fetchUserPosts = async () => {
    try {
      const data = await apiClient.getMyPosts()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const data = await apiClient.getMyStats()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setDeletingPostId(postId)
    try {
      // Delete from backend database
      await apiClient.deletePost(postId)
      
      // Remove from local dashboard state
      setPosts(posts.filter(post => post._id !== postId))
      
      // Remove from global PostsContext cache so other pages are updated
      deletePostFromContext(postId)
      
      // Refresh stats
      fetchUserStats()
      
      // Show success message
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      toast({
        title: "Delete failed",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingPostId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPrice = (price: { amount: number; currency: string }) => {
    return `${price.currency}${price.amount}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="SayDone Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-gray-900 hidden sm:block">SayDone</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/posts">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Create Post</span>
                </Button>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your posts and track your activity</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Posts</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Posts</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activePosts}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Views</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Likes</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Posts Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="text-xl font-semibold">My Posts</CardTitle>
              <Link href="/posts">
                <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">Create your first post to get started</p>
                <Link href="/posts">
                  <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const IconComponent = categoryIcons[post.category as keyof typeof categoryIcons] || MessageCircle
                  const categoryColor = categoryColors[post.category as keyof typeof categoryColors] || 'bg-gray-500'
                  
                  return (
                    <div key={post._id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className={`w-8 h-8 ${categoryColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {post.category.replace('-', ' ')}
                            </Badge>
                            <Badge 
                              variant={post.status === 'active' ? 'default' : 'destructive'}
                              className={post.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {post.status}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                            {post.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2 break-words">
                            {post.description}
                          </p>
                          
                          {/* Mobile-first metadata layout */}
                          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:flex-wrap sm:gap-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1 min-w-0">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{post.location.city}, {post.location.state}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4 flex-shrink-0" />
                              <span>{post.views} views</span>
                            </div>
                            {post.price && (
                              <div className="font-semibold text-orange-600 sm:ml-auto">
                                {formatPrice(post.price)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile-responsive action buttons */}
                        <div className="flex items-center justify-end space-x-2 flex-shrink-0 sm:ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/posts/edit/${post._id}`)}
                            className="flex-shrink-0"
                          >
                            <Edit className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePost(post._id)}
                            disabled={deletingPostId === post._id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            {deletingPostId === post._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Delete</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
