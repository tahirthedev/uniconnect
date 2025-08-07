'use client';

import { useState } from 'react';
import {
  Search,
  MapPin,
  Car,
  Briefcase,
  ShoppingBag,
  Home,
  DollarSign,
  MessageCircle,
  Users,
  Star,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Shield,
  Clock,
  Verified,
} from "lucide-react"
import Navigation from "@/components/navigation"
import SearchForm from "@/components/search-form"
import LocationDisplay from "@/components/location-display"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const categories = [
    {
      name: "Pick & Drop",
      icon: Car,
      color: "bg-orange-100 text-orange-600",
      href: "/ridesharing",
      count: "Active rides",
    },
    { name: "Jobs", icon: Briefcase, color: "bg-orange-100 text-orange-600", href: "/jobs", count: "Fresh openings" },
    {
      name: "Buy/Sell",
      icon: ShoppingBag,
      color: "bg-orange-100 text-orange-600",
      href: "/marketplace",
      count: "Local deals",
    },
    {
      name: "Accommodation",
      icon: Home,
      color: "bg-orange-100 text-orange-600",
      href: "/accommodation",
      count: "Student rooms",
    },
    {
      name: "Currency Exchange",
      icon: DollarSign,
      color: "bg-orange-100 text-orange-600",
      href: "/currency",
      count: "Live rates",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      location: "UCL, London",
      quote: "Found my perfect flatmate and part-time job within a week. SayDone just gets it.",
      image: "https://picsum.photos/60/60?random=1",
      verified: true
    },
    {
      id: 2,
      name: "James Mitchell",
      location: "Manchester University",
      quote: "Never struggled with airport pickups again. The community here is incredible.",
      image: "https://picsum.photos/60/60?random=2",
      verified: true
    },
    {
      id: 3,
      name: "Priya Patel",
      location: "Birmingham Uni",
      quote: "From textbooks to internships, everything I needed was right here.",
      image: "https://picsum.photos/60/60?random=3",
      verified: true
    },
    {
      id: 4,
      name: "Alex Thompson",
      location: "Edinburgh University",
      quote: "The real-time messaging made coordinating group trips so much easier.",
      image: "https://picsum.photos/60/60?random=4",
      verified: true
    }
  ];

  const faqs = [
    {
      question: "How do I verify my student status?",
      answer: "Simply upload your university ID or use your .ac.uk email address. We verify all accounts to maintain our trusted community."
    },
    {
      question: "Is messaging completely secure?",
      answer: "Yes! All messages are encrypted and we never share your personal information. You can also report any inappropriate behavior."
    },
    {
      question: "What areas does SayDone cover?",
      answer: "We're active in all major UK university cities including London, Manchester, Birmingham, Edinburgh, and 50+ other locations."
    },
    {
      question: "How do payments work for services?",
      answer: "We facilitate secure payments between users for services like rides and rentals. Currency exchange happens directly between verified students."
    },
    {
      question: "Can I use SayDone if I'm not a student?",
      answer: "SayDone is exclusively for university students, staff, and recent graduates to maintain our focused community environment."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Overlay Navigation */}
      <div className="relative min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Navigation Overlay */}
        <Navigation />

        {/* Hero Content */}
        <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-5xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
              Reimagine Student
              <span className="block text-white/90">Connections</span>
            </h1>
            
            {/* Subheadline */}
            <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-16 max-w-3xl mx-auto leading-relaxed">
              Services that get things done. Real fast. Real local.
            </h2>

            {/* CTA Button */}
            <div className="mb-20">
              <button className="group bg-white text-orange-600 font-bold text-xl px-12 py-4 rounded-full hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                Get Started Now
                <ArrowRight className="inline-block ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="relative bg-gray-50 py-32">
        {/* Giant Quote Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[400px] font-serif text-gray-100 select-none leading-none">"</span>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-3xl md:text-4xl font-serif text-gray-800 leading-relaxed">
            "I never imagined finding rides, jobs, and rooms could be this smooth. 
            <span className="text-orange-600 font-bold"> SayDone just gets it.</span>"
          </blockquote>
          <cite className="block mt-8 text-lg text-gray-600 font-medium">
            — Emma Rodriguez, King's College London
          </cite>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All your student essentials in one place
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 border border-gray-100 hover:border-orange-200"
                >
                  <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{category.name}</h3>
                  <p className="text-sm text-orange-600 text-center font-medium">{category.count}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* How SayDone Works Section */}
      <div className="bg-gray-50 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How SayDone Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to get things done</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-b-4 border-orange-400 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Find What Moves You</h3>
                <p className="text-gray-600 text-center leading-relaxed">From shared rides to curated jobs – discover exactly what you need in your university community</p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-b-4 border-orange-400 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Speak, Don't Scroll</h3>
                <p className="text-gray-600 text-center leading-relaxed">Real-time direct messaging that cuts through the noise and gets straight to the point</p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-b-4 border-orange-400 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Make It Count</h3>
                <p className="text-gray-600 text-center leading-relaxed">Verified listings, real reviews – every connection matters in our trusted student network</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safe & Trusted Community Section */}
      <div className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">A Community You Can Count On</h2>
            <p className="text-xl text-gray-600">Your safety and trust matter most</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl p-8 text-white shadow-2xl hover:shadow-orange-200 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Verified className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Verified University Listings</h3>
                <p className="text-orange-100 text-center leading-relaxed">Only students. Only trusted circles.</p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl p-8 text-white shadow-2xl hover:shadow-orange-200 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Built by Students</h3>
                <p className="text-orange-100 text-center leading-relaxed">From our dorms to yours.</p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl p-8 text-white shadow-2xl hover:shadow-orange-200 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">24/7 Peer Support</h3>
                <p className="text-orange-100 text-center leading-relaxed">We're here when you need us.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">What Students Say</h2>
            <p className="text-xl text-gray-600">Real stories from our community</p>
          </div>
          
          <div className="flex space-x-8 animate-scroll">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}`} className="flex-shrink-0 w-80">
                <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 h-full">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.location}</p>
                      </div>
                      {testimonial.verified && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Verified className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic text-lg">"{testimonial.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900 flex items-center">
                    <ArrowRight className={`h-5 w-5 text-orange-600 mr-3 transform transition-transform ${activeAccordion === index ? 'rotate-90' : ''}`} />
                    {faq.question}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${activeAccordion === index ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed pl-8">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Before Footer */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <Image
                src="/logo.png"
                alt="SayDone Logo"
                width={120}
                height={158}
                className="mx-auto mb-8"
              />
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                SayDone
              </h2>
              <p className="text-2xl md:text-3xl text-white/90 font-light">
                Do it before it's said
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-4 text-gray-300">
                <li><Link href="/jobs" className="hover:text-orange-400 transition-colors duration-200">Find Jobs</Link></li>
                <li><Link href="/ridesharing" className="hover:text-orange-400 transition-colors duration-200">Ridesharing</Link></li>
                <li><Link href="/accommodation" className="hover:text-orange-400 transition-colors duration-200">Accommodation</Link></li>
                <li><Link href="/marketplace" className="hover:text-orange-400 transition-colors duration-200">Marketplace</Link></li>
                <li><Link href="/currency" className="hover:text-orange-400 transition-colors duration-200">Currency Exchange</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Resources</h4>
              <ul className="space-y-4 text-gray-300">
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Contact Support</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Safety Tips</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Community Guidelines</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Legal</h4>
              <ul className="space-y-4 text-gray-300">
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Terms of Service</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">GDPR Compliance</a></li>
              </ul>
            </div>
            
            {/* About SayDone */}
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">About SayDone</h4>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Connecting UK students through trusted local services. From campus to career, we've got you covered.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-2xl">📘</a>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-2xl">🐦</a>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-2xl">📷</a>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-2xl">💼</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-center md:text-left">
                © 2025 SayDone. All rights reserved. Made with ❤️ for UK students.
              </p>
              
              {/* Subtle Location Display */}
              <div className="mt-4 md:mt-0">
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
          </div>
        </div>
      </footer>
    </div>
  )
}
