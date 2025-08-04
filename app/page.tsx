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
} from "lucide-react"
import Navigation from "@/components/navigation"
import BackendStatus from "@/components/backend-status"
import SearchForm from "@/components/search-form"
import Link from "next/link"

export default function HomePage() {
  const categories = [
    {
      name: "Ridesharing",
      icon: Car,
      color: "bg-orange-100 text-orange-600",
      href: "/ridesharing",
      count: "1.2k active",
    },
    {
      name: "Pick & Drop",
      icon: Package,
      color: "bg-blue-100 text-blue-600",
      href: "/pick-drop",
      count: "856 services",
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
      category: "Ridesharing",
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

      {/* Hero Section - More App-like */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Your Community <br />
                <span className="text-orange-200">Marketplace</span>
              </h1>
              <p className="text-lg mb-6 text-orange-100">Connect with students across UK universities</p>

              {/* Quick Search */}
              <SearchForm />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-orange-200 text-sm">{stat.label}</div>
                  <div className="text-green-300 text-xs mt-1">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
            <p className="text-gray-600">Find exactly what you're looking for</p>
          </div>
          <Link href="/categories" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link
                key={category.name}
                href={category.href}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 text-center mb-1">{category.name}</h3>
                <p className="text-xs text-gray-500 text-center">{category.count}</p>
              </Link>
            )
          })}
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
