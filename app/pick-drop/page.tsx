import { ArrowLeft, MapPin, Clock, Package, Truck, Calendar, Star, Weight } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"

export default function PickDropPage() {
  const services = [
    {
      id: 1,
      provider: "Sarah Johnson",
      rating: 4.9,
      reviews: 67,
      service: "Airport Pickup & Drop",
      description: "Reliable airport transportation service with comfortable sedan",
      price: "$35",
      location: "Manhattan, NY",
      availability: "Available 24/7",
      vehicle: "Honda Accord",
      capacity: "4 passengers + luggage",
      posted: "2 hours ago",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    {
      id: 2,
      provider: "Mike Chen",
      rating: 4.8,
      reviews: 43,
      service: "Furniture Moving Help",
      description: "Help with moving furniture, appliances, and large items",
      price: "$25/hour",
      location: "Brooklyn, NY",
      availability: "Weekends",
      vehicle: "Pickup Truck",
      capacity: "Large items up to 500lbs",
      posted: "5 hours ago",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    {
      id: 3,
      provider: "Emma Wilson",
      rating: 5.0,
      reviews: 29,
      service: "Grocery & Shopping Pickup",
      description: "Personal shopping and delivery service for busy students",
      price: "$15 + tips",
      location: "Queens, NY",
      availability: "Mon-Fri 9AM-6PM",
      vehicle: "SUV",
      capacity: "Multiple shopping bags",
      posted: "1 day ago",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
    },
  ]

  const serviceTypes = [
    "All Services",
    "Airport Transfer",
    "Moving Help",
    "Grocery Pickup",
    "Package Delivery",
    "Furniture Moving",
    "Shopping Service",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pick & Drop Services</h1>
            <p className="text-gray-600">Get help with transportation and delivery</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request Service Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Request a Service</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                    <option>Airport Transfer</option>
                    <option>Moving Help</option>
                    <option>Grocery Pickup</option>
                    <option>Package Delivery</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Enter pickup address"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drop-off Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Enter destination"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="time"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                  <textarea
                    placeholder="Describe what you need help with..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  />
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors">
                  Find Service Providers
                </button>

                <div className="border-t pt-4">
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors">
                    Offer Your Service
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Providers List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Available Services</h2>
                <p className="text-gray-600">856 service providers in your area</p>
              </div>
              <div className="flex items-center gap-3">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                  {serviceTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                  <option>Highest Rated</option>
                  <option>Nearest</option>
                  <option>Lowest Price</option>
                  <option>Most Recent</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={service.avatar || "/placeholder.svg"}
                        alt={service.provider}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900">{service.provider}</h3>
                          {service.verified && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {service.rating} ({service.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{service.price}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.posted}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.service}</h4>
                    <p className="text-gray-600 mb-3">{service.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">Service Area: {service.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">Available: {service.availability}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Truck className="h-4 w-4 mr-2" />
                        <span className="text-sm">Vehicle: {service.vehicle}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Weight className="h-4 w-4 mr-2" />
                        <span className="text-sm">Capacity: {service.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        <span>Insured</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Same day service</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        Message
                      </button>
                      <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                        Book Service
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-medium transition-colors">
                Load More Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
