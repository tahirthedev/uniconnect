"use client"

import { useState, useEffect } from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import Link from "next/link"
import { isAuthenticated, getUserInfo, logout } from "@/lib/auth"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
    setUserInfo(getUserInfo())
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="bg-orange-500 text-white px-3 py-2 rounded-lg font-bold text-xl">UC</div>
            <span className="ml-2 text-xl font-bold text-gray-900">UniConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/posts" className="text-gray-700 hover:text-orange-600 font-medium">
              Browse
            </Link>
            <Link href="/ridesharing" className="text-gray-700 hover:text-orange-600 font-medium">
              Ridesharing
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/bookings" className="text-gray-700 hover:text-orange-600 font-medium">
                  My Bookings
                </Link>
                <Link href="/messages" className="text-gray-700 hover:text-orange-600 font-medium">
                  Messages
                </Link>
              </>
            )}
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">{userInfo?.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-orange-600 font-medium flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link href="/auth" className="text-gray-700 hover:text-orange-600 font-medium">
                Sign In
              </Link>
            )}
            
            {isLoggedIn && (
              <Link href="/ridesharing/offer">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Offer Ride
                </button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-orange-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link href="/posts" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                Browse
              </Link>
              <Link href="/ridesharing" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                Ridesharing
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link href="/bookings" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                    My Bookings
                  </Link>
                  <Link href="/messages" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                    Messages
                  </Link>
                  <div className="px-3 py-2 text-gray-600 font-medium border-t mt-2">
                    {userInfo?.name}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 font-medium"
                  >
                    Logout
                  </button>
                  <Link href="/ridesharing/offer">
                    <button className="w-full text-left bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-medium transition-colors mt-2">
                      Offer Ride
                    </button>
                  </Link>
                </>
              ) : (
                <Link href="/auth" className="block px-3 py-2 text-gray-700 hover:text-orange-600 font-medium">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
