'use client';

import { useEffect } from 'react';
import Navigation from '@/components/navigation';
import UserBookings from '@/components/user-bookings';
import { requireAuth } from '@/lib/auth';

export default function MyBookingsPage() {
  useEffect(() => {
    requireAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">View and manage your ride bookings</p>
        </div>

        <UserBookings />
      </div>
    </div>
  );
}
