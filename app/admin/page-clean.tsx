'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, RefreshCw, Activity, Users, FileText, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Types
export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: 'user' | 'moderator' | 'admin'
  isActive: boolean
  isBanned: boolean
  createdAt: string
  lastActive?: string
  totalPosts?: number
  location?: {
    city: string
    coordinates: number[]
  }
}

export interface Post {
  _id: string
  title: string
  description: string
  category: string
  status: 'active' | 'inactive' | 'expired' | 'completed' | 'flagged' | 'removed'
  author: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  views?: number
  flaggedCount?: number
  location?: {
    city: string
  }
}

export interface DashboardStats {
  totalUsers: number
  totalPosts: number
  flaggedPosts: number
  activeUsers: number
  newUsersToday: number
  newPostsToday: number
}

// Main Component
export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    flaggedPosts: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newPostsToday: 0
  })
  const [currentView, setCurrentView] = useState<'overview' | 'users' | 'posts'>('overview')
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const { toast } = useToast()

  // Admin access check
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/health`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive"
          })
          router.push('/')
          return
        }

        fetchDashboardData()
      } catch (error) {
        console.error('Admin access check error:', error)
        router.push('/auth')
      }
    }

    checkAdminAccess()
  }, [router, toast])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [usersRes, postsRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?limit=100`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/posts?limit=100`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics`, { headers })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats({
          totalUsers: statsData.analytics?.users?.total || 0,
          totalPosts: statsData.analytics?.posts?.total || 0,
          flaggedPosts: statsData.analytics?.posts?.flagged || 0,
          activeUsers: statsData.analytics?.users?.active || 0,
          newUsersToday: statsData.analytics?.users?.today || 0,
          newPostsToday: statsData.analytics?.posts?.today || 0
        })
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-orange-500" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage users, posts, and platform content</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchDashboardData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                Back to Site
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: Activity },
                { key: 'users', label: 'Users', icon: Users },
                { key: 'posts', label: 'Posts', icon: FileText }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    currentView === key
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content based on current view */}
        {currentView === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.totalUsers.toLocaleString()}</p>
                      <p className="text-blue-600 text-sm mt-1">+{stats.newUsersToday} today</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Posts</p>
                      <p className="text-3xl font-bold text-green-900">{stats.totalPosts.toLocaleString()}</p>
                      <p className="text-green-600 text-sm mt-1">+{stats.newPostsToday} today</p>
                    </div>
                    <FileText className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Active Users</p>
                      <p className="text-3xl font-bold text-orange-900">{stats.activeUsers.toLocaleString()}</p>
                      <p className="text-orange-600 text-sm mt-1">Last 24 hours</p>
                    </div>
                    <Activity className="h-12 w-12 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Flagged Posts</p>
                      <p className="text-3xl font-bold text-red-900">{stats.flaggedPosts.toLocaleString()}</p>
                      <p className="text-red-600 text-sm mt-1">Needs attention</p>
                    </div>
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Users ({users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {user.totalPosts || 0} posts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Posts ({posts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {posts.slice(0, 5).map((post) => (
                      <div key={post._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{post.title}</p>
                          <p className="text-sm text-gray-600">by {post.author.name}</p>
                        </div>
                        <div className="text-right ml-4">
                          <Badge variant={
                            post.status === 'active' ? 'default' :
                            post.status === 'flagged' ? 'destructive' : 'secondary'
                          }>
                            {post.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {post.category.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'users' && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Users Management</h3>
            <p className="text-gray-600">User management interface will be implemented here.</p>
            <p className="text-sm text-gray-500 mt-2">Total users: {users.length}</p>
          </div>
        )}

        {currentView === 'posts' && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Posts Management</h3>
            <p className="text-gray-600">Post management interface will be implemented here.</p>
            <p className="text-sm text-gray-500 mt-2">Total posts: {posts.length}</p>
          </div>
        )}
      </div>
    </div>
  )
}
