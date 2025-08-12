import { useState } from 'react'
import { FileText, Search, Filter, Eye, Trash2, CheckCircle, XCircle, MoreHorizontal, MapPin, Calendar, Flag, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Post } from './types'

interface AdminPostsTableProps {
  posts: Post[]
  onRefresh: () => void
}

export function AdminPostsTable({ posts, onRefresh }: AdminPostsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'delete' | 'approve' | 'flag' | 'remove'>('delete')
  const [loading, setLoading] = useState(false)
  
  const { toast } = useToast()

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handlePostAction = async (action: 'delete' | 'approve' | 'flag' | 'remove', post: Post) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let endpoint = ''
      let method = 'DELETE'
      let body = {}

      switch (action) {
        case 'delete':
          endpoint = `/api/admin/posts/${post._id}`
          method = 'DELETE'
          break
        case 'approve':
          endpoint = `/api/admin/posts/${post._id}/status`
          method = 'PUT'
          body = { status: 'active', reason: 'Approved by admin' }
          break
        case 'flag':
          endpoint = `/api/admin/posts/${post._id}/status`
          method = 'PUT'
          body = { status: 'flagged', reason: 'Flagged by admin for review' }
          break
        case 'remove':
          endpoint = `/api/admin/posts/${post._id}/status`
          method = 'PUT'
          body = { status: 'removed', reason: 'Removed by admin' }
          break
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        ...(method !== 'DELETE' && { body: JSON.stringify(body) })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Post ${action === 'delete' ? 'deleted' : action === 'approve' ? 'approved' : action === 'flag' ? 'flagged' : 'removed'} successfully.`
        })
        onRefresh()
      } else {
        throw new Error('Action failed')
      }
    } catch (error) {
      console.error('Post action error:', error)
      toast({
        title: "Error",
        description: "Failed to perform action. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setConfirmDialogOpen(false)
      setSelectedPost(null)
    }
  }

  const openActionDialog = (action: 'delete' | 'approve' | 'flag' | 'remove', post: Post) => {
    setSelectedPost(post)
    setActionType(action)
    setConfirmDialogOpen(true)
  }

  const viewPostDetails = (post: Post) => {
    setSelectedPost(post)
    setPostDialogOpen(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'flagged': return 'destructive'
      case 'removed': return 'destructive'
      case 'expired': return 'secondary'
      case 'completed': return 'outline'
      default: return 'secondary'
    }
  }

  const getCategoryIcon = (category: string) => {
    // You can add specific icons for each category here
    return <FileText className="h-3 w-3" />
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search posts by title, description, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="jobs">Jobs</SelectItem>
                <SelectItem value="ridesharing">Ridesharing</SelectItem>
                <SelectItem value="pick-drop">Pick & Drop</SelectItem>
                <SelectItem value="buy-sell">Buy & Sell</SelectItem>
                <SelectItem value="currency-exchange">Currency Exchange</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Posts Management ({filteredPosts.length})
            </span>
            <Button onClick={onRefresh} variant="outline" size="sm">
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Post</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Author</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">{post.title}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{post.description}</p>
                        {post.location?.city && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {post.location.city}
                          </p>
                        )}
                        {post.views && (
                          <p className="text-xs text-gray-500">{post.views} views</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author.name}
                        </p>
                        <p className="text-sm text-gray-600">{post.author.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize flex items-center gap-1">
                        {getCategoryIcon(post.category)}
                        {post.category.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <Badge variant={getStatusBadgeVariant(post.status)}>
                          {post.status}
                        </Badge>
                        {post.flaggedCount && post.flaggedCount > 0 && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            {post.flaggedCount} reports
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={loading}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Post Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => viewPostDetails(post)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {post.status === 'flagged' && (
                            <DropdownMenuItem 
                              onClick={() => openActionDialog('approve', post)}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Post
                            </DropdownMenuItem>
                          )}
                          {post.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => openActionDialog('flag', post)}
                              className="text-yellow-600"
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Flag Post
                            </DropdownMenuItem>
                          )}
                          {post.status !== 'removed' && (
                            <DropdownMenuItem 
                              onClick={() => openActionDialog('remove', post)}
                              className="text-orange-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Remove Post
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => openActionDialog('delete', post)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPosts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No posts found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post Details Dialog */}
      <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-sm font-medium text-gray-600">Title</label>
                <p className="text-gray-900 font-medium">{selectedPost.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <Badge variant="outline" className="capitalize">
                    {selectedPost.category.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge variant={getStatusBadgeVariant(selectedPost.status)}>
                    {selectedPost.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Author</label>
                  <div>
                    <p className="text-gray-900">{selectedPost.author.name}</p>
                    <p className="text-sm text-gray-600">{selectedPost.author.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-900">{new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedPost.location && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedPost.location.city}
                  </p>
                </div>
              )}
              {selectedPost.views && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Views</label>
                  <p className="text-gray-900">{selectedPost.views.toLocaleString()}</p>
                </div>
              )}
              {selectedPost.flaggedCount && selectedPost.flaggedCount > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reports</label>
                  <p className="text-red-600 font-medium flex items-center gap-1">
                    <Flag className="h-4 w-4" />
                    {selectedPost.flaggedCount} reports
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {actionType === 'delete' && `Are you sure you want to permanently delete "${selectedPost?.title}"? This action cannot be undone.`}
              {actionType === 'approve' && `Are you sure you want to approve "${selectedPost?.title}"? This will make it visible to all users.`}
              {actionType === 'flag' && `Are you sure you want to flag "${selectedPost?.title}" for review?`}
              {actionType === 'remove' && `Are you sure you want to remove "${selectedPost?.title}"? This will hide it from users but keep it in the database.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'delete' || actionType === 'remove' ? "destructive" : 
                      actionType === 'approve' ? "default" : "secondary"}
              onClick={() => selectedPost && handlePostAction(actionType, selectedPost)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 
               actionType === 'delete' ? 'Delete Post' :
               actionType === 'approve' ? 'Approve Post' :
               actionType === 'flag' ? 'Flag Post' :
               'Remove Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
