import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText } from 'lucide-react'
import { User, Post } from './types'

interface AdminOverviewProps {
  users: User[]
  posts: Post[]
}

export function AdminOverview({ users, posts }: AdminOverviewProps) {
  return (
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
            {users.length === 0 && (
              <p className="text-center text-gray-500 py-4">No users found</p>
            )}
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
            {posts.length === 0 && (
              <p className="text-center text-gray-500 py-4">No posts found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
