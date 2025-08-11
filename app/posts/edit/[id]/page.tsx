'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { apiClient } from '@/lib/api'
import LocationSelector from '@/components/location-selector'

interface Post {
  _id: string
  title: string
  description: string
  category: string
  subcategory?: string
  location: {
    city: string
    state: string
    country: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  price?: {
    amount: number
    currency: string
  }
  contact?: {
    phone?: string
    email?: string
    preferredMethod: string
  }
  details?: any
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    location: {
      city: '',
      state: '',
      country: 'UK',
      coordinates: undefined as { latitude: number; longitude: number } | undefined
    },
    price: {
      amount: 0,
      currency: '£'
    },
    contact: {
      phone: '',
      email: '',
      preferredMethod: 'email'
    }
  })

  const categories = [
    { id: 'pick-drop', label: 'Pick & Drop' },
    { id: 'accommodation', label: 'Accommodation' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'buy-sell', label: 'Buy & Sell' },
    { id: 'currency-exchange', label: 'Currency Exchange' },
  ]

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }

      const data = await apiClient.getPostById(postId as string)
      const postData = data.post

      // Check if user owns this post
      const userResponse = await apiClient.getCurrentUser()
      
      if (postData.author._id !== userResponse.user.id) {
        alert('You can only edit your own posts')
        router.push('/dashboard')
        return
      }

      setPost(postData)
      setFormData({
        title: postData.title || '',
        description: postData.description || '',
        category: postData.category || '',
        subcategory: postData.subcategory || '',
        location: {
          city: postData.location?.city || '',
          state: postData.location?.state || '',
          country: postData.location?.country || 'UK',
          coordinates: postData.location?.coordinates
        },
        price: {
          amount: postData.price?.amount || 0,
          currency: postData.price?.currency || '£'
        },
        contact: {
          phone: postData.contact?.phone || '',
          email: postData.contact?.email || '',
          preferredMethod: postData.contact?.preferredMethod || 'email'
        }
      })
    } catch (error) {
      console.error('Error fetching post:', error)
      alert('Failed to load post. Please try again.')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (location: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        city: location.city || '',
        state: location.state || '',
        country: location.country || 'UK',
        coordinates: location.coordinates
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const response = await apiClient.updatePost(postId as string, {
        ...formData,
        price: formData.price.amount > 0 ? formData.price : undefined
      })

      if (response.success) {
        alert('Post updated successfully!')
        router.push('/dashboard')
      } else {
        throw new Error(response.message || 'Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
    } finally {
      setSaving(false)
    }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span className="text-xl font-bold text-gray-900">SayDone</span>
              </Link>
            </div>
            
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a clear, descriptive title"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about your post"
                  rows={4}
                  required
                />
              </div>

              {/* Location */}
              <div>
                <Label>Location *</Label>
                <LocationSelector
                  onLocationSelect={handleLocationChange}
                  defaultLocation={formData.location}
                />
              </div>

              {/* Price (optional) */}
              <div>
                <Label htmlFor="price">Price (optional)</Label>
                <div className="flex space-x-2">
                  <Select 
                    value={formData.price.currency} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      price: { ...prev.price, currency: value } 
                    }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="£">£</SelectItem>
                      <SelectItem value="$">$</SelectItem>
                      <SelectItem value="€">€</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={formData.price.amount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      price: { ...prev.price, amount: parseFloat(e.target.value) || 0 } 
                    }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <Label>Contact Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, email: e.target.value } 
                      }))}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, phone: e.target.value } 
                      }))}
                      placeholder="+44 123 456 7890"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
