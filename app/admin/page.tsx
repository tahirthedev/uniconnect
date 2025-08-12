'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'
import { AdminTabs } from '@/components/admin/AdminTabs'
import { AdminOverview } from '@/components/admin/AdminOverview'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'
import { AdminPostsTable } from '@/components/admin/AdminPostsTable'
import { User, Post, DashboardStats } from '@/components/admin/types'

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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/health`, {
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?limit=100`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts?limit=100`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`, { headers })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      // Calculate posts created today
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      let newPostsToday = 0
      
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        const allPosts = postsData.posts || []
        setPosts(allPosts)
        
        // Count posts created today
        newPostsToday = allPosts.filter((post: any) => {
          const postDate = new Date(post.createdAt)
          return postDate >= todayStart
        }).length
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        const overview = statsData.analytics?.overview || {}
        const userGrowth = statsData.analytics?.userGrowth || []
        
        // Calculate new users today
        const newUsersToday = userGrowth.find((day: any) => {
          const dayDate = day._id
          return dayDate.year === today.getFullYear() && 
                 dayDate.month === today.getMonth() + 1 && 
                 dayDate.day === today.getDate()
        })?.count || 0

        setStats({
          totalUsers: overview.totalUsers || 0,
          totalPosts: overview.totalPosts || 0,
          flaggedPosts: overview.flaggedPosts || 0,
          activeUsers: overview.activeUsers || 0,
          newUsersToday: newUsersToday,
          newPostsToday: newPostsToday
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
          <AdminTabs currentView={currentView} onTabChange={setCurrentView} />
        </div>

        {/* Content based on current view */}
        {currentView === 'overview' && (
          <div className="space-y-6">
            <AdminStatsCards stats={stats} />
            <AdminOverview users={users} posts={posts} />
          </div>
        )}

        {currentView === 'users' && (
          <AdminUsersTable users={users} onRefresh={fetchDashboardData} />
        )}

        {currentView === 'posts' && (
          <AdminPostsTable posts={posts} onRefresh={fetchDashboardData} />
        )}
      </div>
    </div>
  )
}
