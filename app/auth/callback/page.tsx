'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refresh')

    if (token && refreshToken) {
      try {
        // Decode JWT to extract user info
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userInfo = {
          userId: payload.userId,
          email: payload.email,
          name: payload.name,
          role: payload.role
        }
        
        // Store tokens and user info in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        
        // Trigger storage event to update navigation state
        window.dispatchEvent(new Event('storage'))
        
        // Small delay to ensure navigation updates, then redirect
        setTimeout(() => {
          router.replace('/')
        }, 100)
      } catch (error) {
        console.error('Error decoding JWT:', error)
        router.replace('/auth?error=invalid_token')
      }
    } else {
      // If no tokens, redirect to auth page with error
      router.replace('/auth?error=authentication_failed')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
