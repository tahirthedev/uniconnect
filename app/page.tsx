'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Star, MapPin, Briefcase, Home, MessageCircle, Shield, Users, Clock, ArrowRight, GraduationCap, BookOpen, Coffee, Zap, Heart, Twitter, Instagram, Linkedin, Mail, Search, Car, Building, DollarSign, ShoppingBag, TrendingUp, Smartphone, Bell, MessageSquare } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import LocationDisplay from "@/components/location-display"
import MagicBento from "@/components/MagicBento"
import LightRays from "@/components/LightRays"
import BackToTop from "@/components/back-to-top"
import MessagingModal from "@/components/messaging-modal"
import { useLocationData } from '@/contexts/LocationContext'
import { usePosts, usePostsWithFilters } from '@/contexts/PostsContext'
import { getPostUrl, isClickablePost, shouldShowContactButton } from '@/lib/post-utils'

export default function HomePage() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')
  const [messagingModal, setMessagingModal] = useState<{
    isOpen: boolean;
    recipientName: string;
    recipientId: string;
    postTitle: string;
    postId: string;
  }>({
    isOpen: false,
    recipientName: '',
    recipientId: '',
    postTitle: '',
    postId: ''
  })
  const router = useRouter()
  const locationData = useLocationData()
  const { allPosts } = usePosts()

  // Use the new Posts context with filters
  const { posts, loading, error } = usePostsWithFilters({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery.trim() || undefined,
    city: selectedCity === 'all' ? undefined : selectedCity
  })

  // Get available cities from ALL posts, not filtered posts
  const availableCities = Array.from(new Set(allPosts.map(post => post.location.city))).sort()
  const nearbyPostsCount = posts.length

  // Category configuration with better colors and icons
  const categories = [
    { id: 'all', label: 'All', icon: TrendingUp, color: 'bg-gray-500', hoverColor: 'hover:bg-gray-600', enabled: true },
    { id: 'pick-drop', label: 'Rides', icon: Car, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', enabled: true },
    { id: 'accommodation', label: 'Housing', icon: Home, color: 'bg-green-500', hoverColor: 'hover:bg-green-600', enabled: true },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600', enabled: true },
    { id: 'buy-sell', label: 'Marketplace', icon: ShoppingBag, color: 'bg-gray-400', hoverColor: 'hover:bg-gray-400', enabled: false },
    { id: 'currency-exchange', label: 'Currency', icon: DollarSign, color: 'bg-gray-400', hoverColor: 'hover:bg-gray-400', enabled: false },
  ]

  // Get category icon and color for post cards
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accommodation':
        return { icon: Home, color: 'text-green-500', bgColor: 'bg-green-100' };
      case 'pick-drop':
      case 'ridesharing':
        return { icon: Car, color: 'text-blue-500', bgColor: 'bg-blue-100' };
      case 'jobs':
        return { icon: Briefcase, color: 'text-purple-500', bgColor: 'bg-purple-100' };
      case 'buy-sell':
        return { icon: ShoppingBag, color: 'text-pink-500', bgColor: 'bg-pink-100' };
      case 'currency-exchange':
        return { icon: DollarSign, color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
      default:
        return { icon: TrendingUp, color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
  };

  const handleCardClick = (href: string) => {
    router.push(href)
  }

  const handlePostClick = (post: any) => {
    if (isClickablePost(post.category)) {
      const url = getPostUrl(post)
      router.push(url)
    } else if (shouldShowContactButton(post.category)) {
      // Open messaging modal for ridesharing posts
      setMessagingModal({
        isOpen: true,
        recipientName: post.authorInfo?.name || post.author?.name || 'Unknown',
        recipientId: post.authorInfo?._id || post.author?._id || post.user?._id || '',
        postTitle: post.title,
        postId: post._id
      })
    }
  }

  const handleContactPost = (post: any, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setMessagingModal({
      isOpen: true,
      recipientName: post.authorInfo?.name || post.author?.name || 'Unknown',
      recipientId: post.authorInfo?._id || post.author?._id || post.user?._id || '',
      postTitle: post.title,
      postId: post._id
    })
  }

  const handleCategoryChange = (categoryId: string) => {
    // Only make changes if category is actually different
    if (selectedCategory === categoryId) return
    
    setSelectedCategory(categoryId)
    setSelectedCity('all') // Reset city filter when changing category
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled automatically by the PostsContext filtering
  }

  // No more useEffect for fetching - PostsContext handles everything automatically

  // No more useEffect for fetching - PostsContext handles everything automatically

  const testimonials = [
    {
      name: "Emma Thompson",
      location: "Manchester University",
      image: "https://picsum.photos/80/80?random=1",
      quote: "I never imagined finding rides, jobs, and rooms could be this smooth. SayDone just gets it.",
      verified: true
    },
    {
      name: "James Wilson",
      location: "University of Edinburgh",
      image: "https://picsum.photos/80/80?random=2",
      quote: "From finding my perfect flat to landing a part-time job, SayDone made my student life so much easier.",
      verified: true
    },
    {
      name: "Sophie Chen",
      location: "King's College London",
      image: "https://picsum.photos/80/80?random=3",
      quote: "The community here is incredible. Real students, real connections, real results.",
      verified: true
    },
    {
      name: "Alex Rodriguez",
      location: "University of Birmingham",
      image: "https://picsum.photos/80/80?random=4",
      quote: "Finally, a platform that understands what students actually need. Game changer!",
      verified: true
    }
  ]

  const faqs = [
    {
      question: "How do I verify my student status?",
      answer: "Simply upload your student ID or university email during registration. We verify all accounts within 24 hours to maintain our trusted community."
    },
    {
      question: "Is SayDone free to use?",
      answer: "Yes! Basic features are completely free. We offer premium features for enhanced visibility and priority support."
    },
    {
      question: "How do you ensure safety?",
      answer: "All users are verified students, we have 24/7 moderation, secure messaging, and a comprehensive rating system for all services."
    },
    {
      question: "Which universities are supported?",
      answer: "We support all major UK universities. If your university isn't listed, contact us and we'll add it within 48 hours."
    },
    {
      question: "How quickly can I find what I need?",
      answer: "Most students find what they're looking for within 24 hours. Our real-time messaging ensures instant connections."
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden pt-16 transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-transparent transition-colors duration-300"></div>
        
        {/* Dynamic Light Rays Background */}
        <div className="absolute inset-0 w-full h-full">
          <LightRays
            raysOrigin="top-center"
            raysColor="#FF8C42"
            raysSpeed={0.8}
            lightSpread={1.2}
            rayLength={2.0}
            followMouse={false}
            mouseInfluence={0.0}
            noiseAmount={0.05}
            distortion={0.02}
            className="hero-light-rays"
          />
        </div>
        
        {/* Floating student icons animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <GraduationCap className="absolute top-1/4 left-1/4 w-8 h-8 text-orange-300 animate-bounce opacity-30" style={{animationDelay: '0s'}} />
          <BookOpen className="absolute top-1/3 right-1/4 w-6 h-6 text-orange-400 animate-bounce opacity-40" style={{animationDelay: '1s'}} />
          <Coffee className="absolute bottom-1/4 left-1/3 w-7 h-7 text-orange-300 animate-bounce opacity-35" style={{animationDelay: '2s'}} />
          <Zap className="absolute top-1/2 right-1/3 w-5 h-5 text-orange-400 animate-bounce opacity-30" style={{animationDelay: '0.5s'}} />
          <Heart className="absolute bottom-1/3 right-1/5 w-6 h-6 text-orange-300 animate-bounce opacity-40" style={{animationDelay: '1.5s'}} />
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up transition-colors duration-300">
            All Your Student Essentials
            <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent animate-pulse">
              In One Place
            </span>
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-12 font-light leading-relaxed animate-slide-up transition-colors duration-300" style={{animationDelay: '0.2s'}}>
            Services that get things done. Real fast. Real local.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link href="/jobs">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-orange-200 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Find Jobs
              </Button>
            </Link>
            <Link href="/ridesharing">
              <Button 
                size="lg" 
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <Coffee className="w-5 h-5 mr-2" />
                Book Rides
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Enhanced Location & Discovery Section */}
      <section id="locations" className="py-20 bg-gradient-to-br from-white via-orange-50/30 to-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/10 via-transparent to-orange-100/10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Discover What's <span className="text-orange-500">Around You</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find rides, housing, jobs, and more in your local area
            </p>
          </div>

          {/* Location & Search Container */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Location Display Section */}
              <div className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-center">
                  <LocationDisplay 
                    showMap={false}
                    onLocationUpdate={(location) => {
                      // This will trigger the useEffect to fetch new posts
                    }}
                  />
                </div>
              </div>

              {/* Search Section */}
              <div className="p-8">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="h-6 w-6 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search for accommodation, rides, jobs, marketplace items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-32 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    />
                    <Button 
                      type="submit" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Search
                    </Button>
                  </div>
                </form>
              </div>

              {/* Category Pills */}
              <div className="px-8 pb-6">
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map((category) => {
                    const IconComponent = category.icon
                    const isActive = selectedCategory === category.id
                    const isDisabled = !category.enabled
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => category.enabled && handleCategoryChange(category.id)}
                        disabled={isDisabled}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-md ${
                          isDisabled
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : isActive
                            ? 'bg-orange-500 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:text-orange-600 transform hover:scale-105 hover:shadow-lg'
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="text-sm font-medium">{category.label}</span>
                        {isDisabled && <span className="text-xs ml-1">(Soon)</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* City Tabs */}
              {availableCities.length > 0 && (
                <div className="px-8 pb-8 border-t border-gray-100">
                  <div className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        {nearbyPostsCount > 0 ? 'Or Browse by City' : 'Browse by City'}
                      </h4>
                      {nearbyPostsCount > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {nearbyPostsCount} nearby
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => setSelectedCity('all')}
                        className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 ${
                          selectedCity === 'all'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Cities
                      </button>
                      {availableCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city)}
                          className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 ${
                            selectedCity === city
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-lg">Finding the best results for you...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-8">
                {/* Results Header */}
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedCategory === 'all' ? 'Everything' : categories.find(c => c.id === selectedCategory)?.label}
                    {selectedCity !== 'all' ? ` in ${selectedCity}` : ' Near You'}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Found <span className="font-semibold text-orange-600">{posts.length}</span> results
                    {selectedCity !== 'all' ? ` in ${selectedCity}` : ' in your area'}
                    {nearbyPostsCount > 0 && selectedCity === 'all' && (
                      <span className="ml-2 text-green-600">
                        ({nearbyPostsCount} nearby)
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.slice(0, 6).map((post) => (
                    <Card 
                      key={post._id} 
                      className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg overflow-hidden bg-white ${
                        isClickablePost(post.category) ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => handlePostClick(post)}
                    >
                      <CardContent className="p-0">
                        {/* Category Badge */}
                        <div className="relative">
                          <div className="absolute top-4 left-4 z-10">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                              post.category === 'pick-drop' || post.category === 'ridesharing' ? 'bg-blue-500' :
                              post.category === 'accommodation' ? 'bg-green-500' :
                              post.category === 'jobs' ? 'bg-purple-500' :
                              post.category === 'buy-sell' ? 'bg-pink-500' :
                              post.category === 'currency-exchange' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}>
                              {(post.category === 'pick-drop' || post.category === 'ridesharing') && <Car className="h-3 w-3" />}
                              {post.category === 'accommodation' && <Home className="h-3 w-3" />}
                              {post.category === 'jobs' && <Briefcase className="h-3 w-3" />}
                              {post.category === 'buy-sell' && <ShoppingBag className="h-3 w-3" />}
                              {post.category === 'currency-exchange' && <DollarSign className="h-3 w-3" />}
                              <span className="capitalize">{post.category.replace('-', ' ')}</span>
                            </div>
                          </div>
                          
                          {/* Category Icon Display */}
                          <div className={`h-32 ${getCategoryIcon(post.category).bgColor} relative flex items-center justify-center`}>
                            {(() => {
                              const IconComponent = getCategoryIcon(post.category).icon;
                              return <IconComponent className={`w-16 h-16 ${getCategoryIcon(post.category).color}`} />;
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6">
                          <h4 className="font-bold text-gray-900 mb-2 text-lg line-clamp-1 group-hover:text-orange-600 transition-colors duration-200">
                            {post.title}
                          </h4>
                          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                            {post.description}
                          </p>
                          
                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-sm mb-4">
                            <div className="flex items-center gap-1 text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">{post.location?.city || 'Unknown'}</span>
                            </div>
                            {post.price?.amount && (
                              <div className="font-bold text-orange-600 text-lg">
                                £{post.price.amount}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {isClickablePost(post.category) && (
                              <Button 
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePostClick(post)
                                }}
                              >
                                View Details
                              </Button>
                            )}
                            {shouldShowContactButton(post.category) && (
                              <Button 
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={(e) => handleContactPost(post, e)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contact
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* View All Button */}
                <div className="text-center mt-12">
                  <Button 
                    onClick={() => router.push('/posts')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Explore All Posts
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : locationData.hasLocation ? (
              /* No Posts State */
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No posts found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {selectedCategory === 'all' 
                    ? "No posts available in your area yet. Be the first to post something!" 
                    : `No ${categories.find(c => c.id === selectedCategory)?.label.toLowerCase()} posts in your area yet.`
                  }
                </p>
                <div className="space-x-4">
                  <Button 
                    onClick={() => setSelectedCategory('all')}
                    variant="outline"
                    className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-semibold"
                  >
                    View All Categories
                  </Button>
                  <Button 
                    onClick={() => router.push('/posts')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    Create Post
                  </Button>
                </div>
              </div>
            ) : (
              /* No Location State */
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <MapPin className="h-12 w-12 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Enable location to get started</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Allow location access to see relevant posts in your area and connect with your local community.
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Enable Location
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">How SayDone Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Find What Moves You</h3>
                <p className="text-gray-600">From shared rides to curated jobs</p>
                <div className="mt-6 h-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Speak, Don't Scroll</h3>
                <p className="text-gray-600">Real-time direct messaging</p>
                <div className="mt-6 h-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Make It Count</h3>
                <p className="text-gray-600">Verified listings, real reviews</p>
                <div className="mt-6 h-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Image Section */}
      <section id="featured" className="py-24 bg-gradient-to-br from-white via-orange-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/10 via-transparent to-orange-100/10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Your Student Life
                  <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Simplified
                  </span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  From finding the perfect flat to landing your dream job, we connect students with everything they need to thrive at university.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Housing</h3>
                  <p className="text-gray-600 text-sm">Find affordable student accommodation near campus</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Jobs</h3>
                  <p className="text-gray-600 text-sm">Discover part-time work opportunities</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4">
                    <Car className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Transport</h3>
                  <p className="text-gray-600 text-sm">Share rides with fellow students</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-4">
                    <ShoppingBag className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketplace</h3>
                  <p className="text-gray-600 text-sm">Buy and sell student essentials</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/posts">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Explore All Services
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-200"
                  >
                    Join Community
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 to-orange-300/50 rounded-3xl transform rotate-3 scale-105"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image
                    src="/hero-image.jpg"
                    alt="Student Life Simplified"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce" style={{animationDelay: '0.5s'}}>
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">What Students Say</h2>
          </div>
          <div className="relative">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="max-w-2xl mx-auto bg-white border-2 border-orange-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="relative mb-6">
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          width={80}
                          height={80}
                          className="rounded-full mx-auto border-4 border-orange-100"
                        />
                        {testimonial.verified && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                            Student Verified
                          </div>
                        )}
                      </div>
                      <blockquote className="text-lg text-gray-700 mb-4 italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                        ))}
                      </div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 flex items-center">
                    <ArrowRight className={`w-4 h-4 text-orange-500 mr-3 transition-transform duration-200 ${
                      activeAccordion === index ? 'rotate-90' : ''
                    }`} />
                    {faq.question}
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  activeAccordion === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-4 text-gray-600 ml-7">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Coming Soon Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl mb-6 shadow-xl">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Mobile App <span className="text-orange-500">Coming Soon</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Get ready for the ultimate student experience on the go. Our mobile app will bring all of SayDone's features right to your fingertips.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Notifications</h3>
                <p className="text-gray-600">Get notified instantly when new posts match your preferences</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Location-Based</h3>
                <p className="text-gray-600">Find services and opportunities right around your campus</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat Integration</h3>
                <p className="text-gray-600">Message other students directly through the app</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Download on the</p>
                  <p className="text-lg font-semibold text-gray-900">App Store</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Get it on</p>
                  <p className="text-lg font-semibold text-gray-900">Google Play</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              🚀 Expected launch: <span className="font-semibold text-orange-600">Early 2026</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Before Footer */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/logo-white.png"
                alt="SayDone Logo"
                width={64}
                height={64}
                className="rounded-2xl mr-4"
              />
              <span className="text-4xl font-bold text-white">SayDone</span>
            </div>
            <p className="text-2xl sm:text-3xl text-white mb-8 font-light">
              Do it before it's said
            </p>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full blur-xl opacity-30"></div>
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="relative bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Join SayDone Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/jobs" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Jobs</Link></li>
                <li><Link href="/ridesharing" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Rides</Link></li>
                <li><Link href="/accommodation" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Accommodation</Link></li>
                <li><Link href="/currency" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Currency Exchange</Link></li>
              </ul>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Safety Tips</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Community Guidelines</a></li>
              </ul>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Terms of Service</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors transform hover:translate-x-1 duration-200 inline-block">Data Protection</a></li>
              </ul>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">About SayDone</h3>
              <p className="text-gray-300 mb-4">
                Connecting UK students with the services they need, when they need them.
              </p>
              <div className="flex items-center space-x-3 animate-float mb-6">
                <Image
                  src="/logo-white.png"
                  alt="SayDone Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">SayDone</span>
              </div>
              
              {/* Contact Email */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2 text-orange-400">Contact</h4>
                <a 
                  href="mailto:swagbroindustries@gmail.com"
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                >
                  swagbroindustries@gmail.com
                </a>
              </div>
            </div>
          </div>
          
          {/* Social Icons - Centered above separator */}
          <div className="flex justify-center items-center space-x-6 mt-8 mb-8">
            <a 
              href="https://x.com/saydoneofficial" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-400 transition-colors duration-200 hover:scale-110 transform"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a 
              href="https://www.instagram.com/saydone_official/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-400 transition-colors duration-200 hover:scale-110 transform"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://www.linkedin.com/in/saydone-website-91a417379?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-400 transition-colors duration-200 hover:scale-110 transform"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 animate-slide-up">
              © {new Date().getFullYear()} SayDone. All rights reserved. Made for students, by students.
            </p>
            
            {/* Hidden Location Display - Keeping location functionality */}
            <div className="hidden">
              <LocationDisplay 
                onLocationUpdate={(location) => {
                  const existingLocation = sessionStorage.getItem('userLocation');
                  if (!existingLocation) {
                    sessionStorage.setItem('userLocation', JSON.stringify(location));
                    sessionStorage.setItem('locationTimestamp', Date.now().toString());
                    (window as any).userLocation = location;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </footer>
      
      {/* Back to Top Button */}
      <BackToTop />

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={messagingModal.isOpen}
        onClose={() => setMessagingModal({ ...messagingModal, isOpen: false })}
        recipientName={messagingModal.recipientName}
        recipientId={messagingModal.recipientId}
        rideTitle={messagingModal.postTitle}
        rideId={messagingModal.postId}
      />
    </div>
  )
}