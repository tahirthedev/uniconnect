'use client';

import { useState, useCallback } from "react";
import { ArrowLeft, ArrowUpDown, MapPin, Clock, TrendingUp, Calculator, User, Star, Shield } from "lucide-react"
import Link from "next/link"
import LocationFilter from "@/components/location-filter"

export default function CurrencyExchangePage() {
  const [locationData, setLocationData] = useState<any>(null);

  const handleLocationFilterChange = useCallback((data: any) => {
    setLocationData(data);
    // In a real app, you would filter exchanges based on location here
  }, []);
  const exchanges = [
    {
      id: 1,
      user: "Sarah Johnson",
      rating: 4.9,
      reviews: 45,
      offering: { currency: "USD", amount: 500, flag: "🇺🇸" },
      seeking: { currency: "EUR", amount: 425, flag: "🇪🇺" },
      rate: "1 USD = 0.85 EUR",
      location: "Manhattan, NY",
      posted: "2 hours ago",
      verified: true,
      meetingSpots: ["Starbucks on 42nd St", "Chase Bank Branch", "Public locations only"],
    },
    {
      id: 2,
      user: "Mike Chen",
      rating: 4.8,
      reviews: 32,
      offering: { currency: "GBP", amount: 300, flag: "🇬🇧" },
      seeking: { currency: "USD", amount: 375, flag: "🇺🇸" },
      rate: "1 GBP = 1.25 USD",
      location: "Brooklyn, NY",
      posted: "4 hours ago",
      verified: true,
      meetingSpots: ["Bank of America", "Coffee shops", "University campus"],
    },
    {
      id: 3,
      user: "Emma Wilson",
      rating: 5.0,
      reviews: 28,
      offering: { currency: "CAD", amount: 800, flag: "🇨🇦" },
      seeking: { currency: "USD", amount: 600, flag: "🇺🇸" },
      rate: "1 CAD = 0.75 USD",
      location: "Queens, NY",
      posted: "1 day ago",
      verified: false,
      meetingSpots: ["TD Bank", "Public libraries", "Shopping centers"],
    },
  ]

  const popularCurrencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸", rate: "1.00" },
    { code: "EUR", name: "Euro", flag: "🇪🇺", rate: "0.85" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: "0.79" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", rate: "1.35" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", rate: "1.52" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", rate: "149.50" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Currency Exchange</h1>
            <p className="text-gray-600">Exchange currencies safely with your community</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exchange Calculator & Location Filter */}
          <div className="lg:col-span-1">
            {/* Location Filter */}
            <div className="mb-6">
              <LocationFilter
                onFilterChange={handleLocationFilterChange}
                compact={true}
              />
            </div>

            {/* Exchange Calculator */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Exchange Calculator
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I have</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                      <option>🇺🇸 USD</option>
                      <option>🇪🇺 EUR</option>
                      <option>🇬🇧 GBP</option>
                      <option>🇨🇦 CAD</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button className="p-2 bg-orange-100 hover:bg-orange-200 rounded-full transition-colors">
                    <ArrowUpDown className="h-5 w-5 text-orange-600" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I want</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                      <option>🇪🇺 EUR</option>
                      <option>🇺🇸 USD</option>
                      <option>🇬🇧 GBP</option>
                      <option>🇨🇦 CAD</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Current Rate</div>
                  <div className="text-lg font-semibold">1 USD = 0.85 EUR</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.2% from yesterday
                  </div>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors">
                  Find Exchange Partners
                </button>
              </div>
            </div>

            {/* Post Exchange Request */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Post Exchange Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Preferred meeting area"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors">
                  Post Request
                </button>
              </div>
            </div>

            {/* Popular Currencies */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Popular Currencies</h3>
              <div className="space-y-3">
                {popularCurrencies.map((currency) => (
                  <div
                    key={currency.code}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{currency.flag}</span>
                      <div>
                        <div className="font-medium text-sm">{currency.code}</div>
                        <div className="text-xs text-gray-500">{currency.name}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{currency.rate}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Exchange Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Available Exchanges</h2>
                <p className="text-gray-600">89 exchange offers in your area</p>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                <option>Best Rate</option>
                <option>Nearest Location</option>
                <option>Highest Rated</option>
                <option>Most Recent</option>
              </select>
            </div>

            <div className="space-y-6">
              {exchanges.map((exchange) => (
                <div key={exchange.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src="/placeholder.svg?height=48&width=48"
                        alt={exchange.user}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900">{exchange.user}</h3>
                          {exchange.verified && <Shield className="h-4 w-4 text-green-500 ml-2" />}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {exchange.rating} ({exchange.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {exchange.posted}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-2xl mb-1">{exchange.offering.flag}</div>
                        <div className="font-semibold text-lg">
                          {exchange.offering.amount} {exchange.offering.currency}
                        </div>
                        <div className="text-sm text-gray-600">Offering</div>
                      </div>

                      <div className="flex flex-col items-center">
                        <ArrowUpDown className="h-6 w-6 text-orange-500 mb-2" />
                        <div className="text-sm font-medium text-gray-700">{exchange.rate}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl mb-1">{exchange.seeking.flag}</div>
                        <div className="font-semibold text-lg">
                          {exchange.seeking.amount} {exchange.seeking.currency}
                        </div>
                        <div className="text-sm text-gray-600">Seeking</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{exchange.location}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Preferred meeting spots:</strong> {exchange.meetingSpots.join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {exchange.verified && (
                        <div className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          <span>Verified</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{exchange.reviews} exchanges</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        Message
                      </button>
                      <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                        Make Offer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Safety Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Always meet in public, well-lit locations</li>
                <li>• Verify exchange rates before meeting</li>
                <li>• Check currency authenticity carefully</li>
                <li>• Consider bringing a friend for large exchanges</li>
                <li>• Use our in-app messaging for all communications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
