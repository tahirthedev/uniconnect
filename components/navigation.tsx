"use client"

import { useState, useEffect } from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getUserInfo, logout } from "@/lib/auth"
import LocationDisplay from "@/components/location-display"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="SayDone Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-gray-900 transition-colors duration-200">SayDone</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/posts">
              <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 transform hover:scale-105">
                Posts
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 transform hover:scale-105">
                Jobs
              </Button>
            </Link>
            <Link href="/ridesharing">
              <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 transform hover:scale-105">
                Rides
              </Button>
            </Link>
            <Link href="/accommodation">
              <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 transform hover:scale-105">
                Accommodation
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 transform hover:scale-105">
                Marketplace
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 transform hover:scale-105">
                Messages
              </Button>
            </Link>
            
            {isLoggedIn && (
              <Link href="/dashboard">
                <Button variant="ghost" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 transform hover:scale-105">
                  My Posts
                </Button>
              </Link>
            )}
            
            {isLoggedIn && userInfo ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 rounded-lg animate-pulse">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    Hi, {userInfo.name?.split(' ')[0] || userInfo.email?.split('@')[0] || 'User'}!
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 transform hover:scale-105"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 transform hover:scale-105">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-orange-200 transform hover:scale-105">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-orange-600 transition-colors duration-200">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link href="/posts" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                Posts
              </Link>
              <Link href="/jobs" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                Jobs
              </Link>
              <Link href="/ridesharing" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                Rides
              </Link>
              <Link href="/accommodation" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                Accommodation
              </Link>
              <Link href="/marketplace" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                Marketplace
              </Link>
              <Link href="/messages" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                Messages
              </Link>
              
              {isLoggedIn && (
                <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                  My Posts
                </Link>
              )}
              
              {isLoggedIn && userInfo ? (
                <>
                  <div className="px-3 py-2 text-orange-600 font-medium border-t mt-2">
                    Hi, {userInfo.name?.split(' ')[0] || userInfo.email?.split('@')[0] || 'User'}!
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                    Login
                  </Link>
                  <Link href="/auth" className="block px-3 py-2 text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg mx-3">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
