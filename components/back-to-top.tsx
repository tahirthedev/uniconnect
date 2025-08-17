'use client';

import { useState } from 'react';
import { Plus, Briefcase, Car, Home, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CreatePostFab() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
    {
      name: 'Job',
      fullName: 'Post Job',
      icon: Briefcase,
      href: '/jobs/post',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
      shadowColor: 'shadow-purple-200',
    },
    {
      name: 'Ride',
      fullName: 'Offer Ride',
      icon: Car,
      href: '/ridesharing/offer',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
      shadowColor: 'shadow-blue-200',
    },
    {
      name: 'Housing',
      fullName: 'List Property',
      icon: Home,
      href: '/accommodation/list',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-600 to-green-700',
      shadowColor: 'shadow-green-200',
    },
    {
      name: 'Market\nplace',
      fullName: 'Sell Item',
      icon: ShoppingBag,
      href: '/marketplace/sell',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'from-orange-600 to-orange-700',
      shadowColor: 'shadow-orange-200',
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50">
      {/* Service Menu - Card Grid Layout */}
      {isMenuOpen && (
        <div className="absolute bottom-16 sm:bottom-20 lg:bottom-24 right-0 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/50 p-4 sm:p-6 min-w-[280px] sm:min-w-[320px] max-w-[calc(100vw-2rem)] sm:max-w-none">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Quick Post</h3>
              <p className="text-xs sm:text-sm text-gray-500">Create your post in seconds</p>
            </div>
            
            {/* Service Grid - Responsive */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <Link key={service.href} href={service.href}>
                    <div 
                      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${service.gradient} hover:${service.hoverGradient} transition-all duration-300 transform hover:scale-105 hover:${service.shadowColor} hover:shadow-xl cursor-pointer animate-slide-up`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full -translate-y-6 sm:-translate-y-8 translate-x-6 sm:translate-x-8"></div>
                      
                      {/* Content */}
                      <div className="relative p-3 sm:p-4 text-center text-white min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center">
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-xs sm:text-sm font-semibold leading-tight whitespace-pre-line">
                          {service.name}
                        </div>
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="text-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">Choose a service to get started</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main FAB Button - Responsive sizing */}
      <div className="relative">
        {/* Pulse Effect */}
        {!isMenuOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-ping opacity-20"></div>
        )}
        
        {/* Main Button - Responsive */}
        <Button
          onClick={toggleMenu}
          className={`relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 sm:border-4 border-white ${
            isMenuOpen ? 'rotate-45 scale-110' : ''
          }`}
          size="icon"
          aria-label="Create post"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white transition-transform duration-300" />
          ) : (
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white transition-transform duration-300" />
          )}
        </Button>
        
        {/* Tooltip - Hidden on mobile, shown on larger screens */}
        {!isMenuOpen && (
          <div className="absolute bottom-14 sm:bottom-16 lg:bottom-20 right-0 bg-gray-800 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium shadow-lg animate-bounce whitespace-nowrap hidden sm:block">
            <div className="relative">
              Quick Post
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
