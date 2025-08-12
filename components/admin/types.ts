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
