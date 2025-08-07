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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section - Clean and Focused */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="space-y-8">
            {/* Location Display */}
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-lg font-medium">
              <MapPin className="h-5 w-5 mr-2" />
              <LocationDisplay 
                onLocationUpdate={(location) => {
                  // Check if we already have location for this session
                  const existingLocation = sessionStorage.getItem('userLocation');
                  if (!existingLocation) {
                    // Only store and log if this is the first location update
                    sessionStorage.setItem('userLocation', JSON.stringify(location));
                    sessionStorage.setItem('locationTimestamp', Date.now().toString());
                    (window as any).userLocation = location;
                  }
                }}
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Your Student Community
            </h1>
            
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Connect with students in your area for rides, accommodation, jobs, and more
            </p>

            {/* Search Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl mx-auto">
              <SearchForm />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section - Enhanced */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore <span className="text-orange-600">Categories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find exactly what you need in your student community
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
        </div>
      </div>

      {/* Backend Status - Development only */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-200">
        <div className="flex justify-center">
          <BackendStatus />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How UniConnect Works</h2>
            <p className="text-xl text-gray-600">Simple steps to connect with your community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search & Discover</h3>
              <p className="text-gray-600">Find what you need in your local area - from rides to accommodation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect & Chat</h3>
              <p className="text-gray-600">Message other students directly through our secure platform</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rate & Review</h3>
              <p className="text-gray-600">Build trust in the community through honest reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Trust Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Safe & Trusted Community</h2>
            <p className="text-xl text-gray-600">Your safety is our priority</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Locations</h3>
              <p className="text-gray-600 text-sm">All listings verified within university areas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Student Community</h3>
              <p className="text-gray-600 text-sm">Built by students, for students across the UK</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted Reviews</h3>
              <p className="text-gray-600 text-sm">Real reviews from verified community members</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Round-the-clock community support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Help Us Improve</h2>
            <p className="text-xl text-gray-600">Your feedback makes UniConnect better for everyone</p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="your.email@university.ac.uk"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  id="feedback"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Tell us what you think about UniConnect, what features you'd like to see, or any issues you've encountered..."
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-orange-400 mb-4">UniConnect</h3>
              <p className="text-gray-300 mb-4 max-w-md">
                Connecting students across the UK for rides, accommodation, jobs, and community support. 
                Built by students, for students.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/jobs" className="hover:text-orange-400 transition-colors">Find Jobs</Link></li>
                <li><Link href="/accommodation" className="hover:text-orange-400 transition-colors">Accommodation</Link></li>
                <li><Link href="/ridesharing" className="hover:text-orange-400 transition-colors">Ridesharing</Link></li>
                <li><Link href="/marketplace" className="hover:text-orange-400 transition-colors">Marketplace</Link></li>
                <li><Link href="/currency" className="hover:text-orange-400 transition-colors">Currency Exchange</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Safety Tips</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Report Issue</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Community Guidelines</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 UniConnect. All rights reserved. Made with ❤️ for UK students.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
