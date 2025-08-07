'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Star, MapPin, Briefcase, Home, MessageCircle, Shield, Users, Clock, ArrowRight, User, LogOut } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import LocationDisplay from "@/components/location-display"
import { isAuthenticated, getUserInfo, logout } from "@/lib/auth"

export default function HomePage() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = () => {
      const loggedIn = isAuthenticated()
      setIsLoggedIn(loggedIn)
      if (loggedIn) {
        const user = getUserInfo()
        setUserInfo(user)
      }
    }
    
    checkAuth()
    
    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setUserInfo(null)
  }

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
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="SayDone Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">SayDone</span>
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/jobs">
                <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200">
                  Jobs
                </Button>
              </Link>
              <Link href="/ridesharing">
                <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200">
                  Rides
                </Button>
              </Link>
              <Link href="/accommodation">
                <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200">
                  Accommodation
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200">
                  Marketplace
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200">
                  Messages
                </Button>
              </Link>
              
              {isLoggedIn && userInfo ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 rounded-lg">
                    <User className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">
                      Hi, {userInfo.name?.split(' ')[0] || userInfo.email?.split('@')[0] || 'User'}!
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="outline" className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-orange-200">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-transparent"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {isLoggedIn && userInfo ? (
            <>
              <div className="mb-4 inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <User className="w-5 h-5 text-orange-600" />
                <span className="text-orange-700 font-medium">
                  Welcome back, {userInfo.name?.split(' ')[0] || userInfo.email?.split('@')[0] || 'User'}!
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Your Student
                <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Hub Awaits
                </span>
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-12 font-light leading-relaxed">
                Discover local opportunities, connect with students, and get things done.
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/jobs">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-orange-200 transition-all duration-300 transform hover:scale-105"
                  >
                    Find Jobs
                  </Button>
                </Link>
                <Link href="/ridesharing">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                  >
                    Book Rides
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Reimagine Student
                <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Connections
                </span>
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-12 font-light leading-relaxed">
                Services that get things done. Real fast. Real local.
              </h2>
              <Link href="/auth">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-orange-200 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Now
                </Button>
              </Link>
            </>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Review Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <span className="text-[20rem] font-serif text-orange-300">"</span>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-800 leading-relaxed">
            "I never imagined finding rides, jobs, and rooms could be this smooth. SayDone just gets it."
          </blockquote>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Your Local Hub</h2>
            <p className="text-xl text-gray-600">Services tailored to your location</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <LocationDisplay 
                  showMap={true}
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
              <div className="order-1 md:order-2">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Hyper-Local Services</h3>
                      <p className="text-gray-600">Find rides, jobs, and accommodation within walking distance of your campus.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy Protected</h3>
                      <p className="text-gray-600">Your location is used only to show relevant local services. We never share your exact location.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Updates</h3>
                      <p className="text-gray-600">Get instant notifications for new opportunities in your area.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">All Your Student Essentials</h2>
            <p className="text-xl text-gray-600">Everything you need in one place</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Link href="/jobs" className="group">
              <Card className="bg-white border-2 border-gray-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Jobs</h3>
                  <p className="text-sm text-gray-600">Part-time opportunities</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/ridesharing" className="group">
              <Card className="bg-white border-2 border-gray-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Rides</h3>
                  <p className="text-sm text-gray-600">Share the journey</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/accommodation" className="group">
              <Card className="bg-white border-2 border-gray-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Accommodation</h3>
                  <p className="text-sm text-gray-600">Find your home</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/marketplace" className="group">
              <Card className="bg-white border-2 border-gray-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Marketplace</h3>
                  <p className="text-sm text-gray-600">Buy & sell items</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/currency" className="group">
              <Card className="bg-white border-2 border-gray-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Currency</h3>
                  <p className="text-sm text-gray-600">Exchange rates</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Safe & Trusted Community Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">A Community You Can Count On</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Verified University Listings</h3>
                  <p className="text-gray-600">Only students. Only trusted circles.</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Built by Students</h3>
                  <p className="text-gray-600">From our dorms to yours.</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Peer Support</h3>
                  <p className="text-gray-600">We're here when you need us.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 overflow-hidden">
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
      <section className="py-24 bg-white">
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

      {/* CTA Before Footer */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/logo.png"
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
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/jobs" className="text-gray-300 hover:text-white transition-colors">Jobs</Link></li>
                <li><Link href="/ridesharing" className="text-gray-300 hover:text-white transition-colors">Rides</Link></li>
                <li><Link href="/accommodation" className="text-gray-300 hover:text-white transition-colors">Accommodation</Link></li>
                <li><Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/currency" className="text-gray-300 hover:text-white transition-colors">Currency Exchange</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Safety Tips</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Community Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Data Protection</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">About SayDone</h3>
              <p className="text-gray-300 mb-4">
                Connecting UK students with the services they need, when they need them.
              </p>
              <div className="flex items-center space-x-3">
                <Image
                  src="/logo.png"
                  alt="SayDone Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">SayDone</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} SayDone. All rights reserved. Made with for UK students.
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
    </div>
  )
}
