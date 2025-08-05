'use client';

import {
  Search,
  MapPin,
  Car,
  Package,
  Briefcase,
  ShoppingBag,
  Home,
  DollarSign,
  Clock,
  ArrowRight,
  Filter,
  Users,
  Star,
} from "lucide-react"
import Navigation from "@/components/navigation"
import BackendStatus from "@/components/backend-status"
import SearchForm from "@/components/search-form"
import LocationDisplay from "@/components/location-display"
import Link from "next/link"

export default function HomePage() {
  const categories = [
    {
      name: "Pick & Drop",
      icon: Car,
      color: "bg-orange-100 text-orange-600",
      href: "/ridesharing",
      count: "1.2k active",
    },
    { name: "Jobs", icon: Briefcase, color: "bg-green-100 text-green-600", href: "/jobs", count: "2.3k openings" },
    {
      name: "Buy/Sell",
      icon: ShoppingBag,
      color: "bg-purple-100 text-purple-600",
      href: "/marketplace",
      count: "5.1k items",
    },
    {
      name: "Accommodation",
      icon: Home,
      color: "bg-pink-100 text-pink-600",
      href: "/accommodation",
      count: "432 rooms",
    },
    {
      name: "Currency Exchange",
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600",
      href: "/currency",
      count: "89 offers",
    },
  ]

  const recentListings = [
    {
      id: 1,
      title: "Daily commute Central London → UCL",
      category: "Pick & Drop",
      price: "£8/day",
      location: "London",
      time: "5 min ago",
      image: "/placeholder.svg?height=120&width=200",
      urgent: true,
    },
    {
      id: 2,
      title: "MacBook Pro M3 - Like New",
      category: "Buy/Sell",
      price: "£1,200",
      location: "Manchester",
      time: "12 min ago",
      image: "/placeholder.svg?height=120&width=200",
      featured: true,
    },
    {
      id: 3,
      title: "Airport pickup from Heathrow",
      category: "Pick & Drop",
      price: "£25",
      location: "London",
      time: "18 min ago",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 4,
      title: "Part-time React Developer",
      category: "Jobs",
      price: "£18/hr",
      location: "Birmingham",
      time: "25 min ago",
      image: "/placeholder.svg?height=120&width=200",
    },
  ]

  const trendingSearches = [
    "Heathrow rides",
    "iPhone 15",
    "Room near campus",
    "Part-time jobs",
    "GBP to EUR",
    "Moving help",
  ]

  const quickStats = [
    { label: "Active Users", value: "12.5K", trend: "+12%" },
    { label: "Daily Posts", value: "340", trend: "+8%" },
    { label: "Success Rate", value: "94%", trend: "+2%" },
    { label: "Avg Response", value: "< 2hrs", trend: "-15min" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section - Modern with Location */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location-based marketplace
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Find everything
                  <span className="block text-orange-200">near you</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-orange-100 leading-relaxed">
                  Connect with your local community. From rides to accommodation, jobs to marketplace - all within your neighborhood.
                </p>
              </div>

              {/* Enhanced Search */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <SearchForm />
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Near me", "University rides", "Student housing", "Part-time jobs"].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-orange-200 text-sm">{stat.label}</div>
                    <div className="text-green-300 text-xs mt-1">{stat.trend}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Location & Visual */}
            <div className="space-y-6">
              {/* Location Display */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Location</h3>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <LocationDisplay 
                  onLocationUpdate={(location) => {
                    console.log('Location updated:', location);
                    (window as any).userLocation = location;
                  }}
                />
              </div>

              {/* Community Highlights */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4">Live Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <Car className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">3 new rides available</p>
                      <p className="text-xs text-orange-200">Within 5km of you</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                      <Home className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">12 rooms posted today</p>
                      <p className="text-xs text-orange-200">In your area</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">8 job openings</p>
                      <p className="text-xs text-orange-200">Near universities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Hint */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 border border-white/30">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <span className="text-sm text-white/90">Scroll to explore categories</span>
          </div>
        </div>
      </div>

      {/* Categories Section - Enhanced */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover What's <span className="text-orange-600">Around You</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your neighborhood marketplace connects you with everything you need, from quick rides to your next home.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border border-gray-100"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 text-center mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500 text-center">{category.count}</p>
                  
                  {/* Activity indicator */}
                  <div className="mt-3 flex justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location Verified</h3>
              <p className="text-gray-600 text-sm">All listings are verified within your local area</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600 text-sm">Built by students, for students across UK universities</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted Reviews</h3>
              <p className="text-gray-600 text-sm">Real reviews from real community members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Status - Development only */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-200">
        <div className="flex justify-center">
          <BackendStatus />
        </div>
      </div>

      {/* Recent Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
            <p className="text-gray-600">Fresh posts from your community</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <Link href="/posts" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={listing.image || "/placeholder.svg"}
                  alt={listing.title}
                  className="w-full h-32 object-cover"
                />
                {listing.urgent && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Urgent
                  </span>
                )}
                {listing.featured && (
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{listing.category}</span>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {listing.time}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {listing.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {listing.location}
                  </div>
                  <div className="font-bold text-orange-600">{listing.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Searches */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Searches</h2>
            <p className="text-gray-600">What others are looking for</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {trendingSearches.map((search, index) => (
              <button
                key={index}
                className="bg-gray-100 hover:bg-orange-100 hover:text-orange-700 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-orange-100 text-lg">Thousands of students, expats, and locals connecting daily</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">12.5K+</div>
              <div className="text-orange-200">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">8.2K+</div>
              <div className="text-orange-200">Successful Matches</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-orange-200">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-orange-200">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
