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
      // Store tokens in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Redirect to homepage
      router.replace('/')
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
