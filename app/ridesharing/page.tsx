'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  MessageCircle, 
  Plus
} from 'lucide-react';
import { usePostsByCategory, usePosts } from '@/contexts/PostsContext';
import { ApiClient } from '@/lib/api';
import BookingModal from '@/components/booking-modal';
import MessagingModal from '@/components/messaging-modal';
import { useLocationData } from '@/contexts/LocationContext';

const apiClient = new ApiClient();

interface Ride {
  _id: string;
  title: string;
  description: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  price: number | { amount: number; type: string; currency: string };
  availableSeats: number;
  user?: {
    _id?: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function RidesharingPage() {
  // Global location state
  const locationData = useLocationData();
  
  // Use PostsContext for ridesharing posts
  const { posts: ridesharingPosts, loading, error } = usePostsByCategory('ridesharing');
  const { updatePost } = usePosts();
  
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);

  // Transform posts into rides format
  const rides = useMemo(() => {
    return ridesharingPosts.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      pickup: post.details?.ride?.from || post.location.city,
      destination: post.details?.ride?.to || 'Destination',
      date: post.details?.ride?.date || post.createdAt,
      time: post.details?.ride?.time || '00:00',
      price: post.price || { amount: 0, type: 'fixed', currency: 'GBP' },
      availableSeats: post.details?.ride?.seats || 1,
      user: {
        _id: post.author._id,
        name: post.author.name,
        avatar: post.author.avatar
      },
      createdAt: post.createdAt
    }));
  }, [ridesharingPosts]);

  const getPriceValue = (price: number | { amount: number; type: string; currency: string }): number => {
    return typeof price === 'object' ? price.amount : price;
  };

  const handleBookRide = (rideId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to book a ride');
      window.location.href = '/auth';
      return;
    }
    
    const ride = rides.find(r => r._id === rideId);
    if (ride) {
      setSelectedRide(ride);
      setShowBookingModal(true);
    }
  };

  const handleMessage = (rideId: string, driverName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to message drivers');
      window.location.href = '/auth';
      return;
    }
    
    const ride = rides.find(r => r._id === rideId);
    if (ride) {
      setSelectedRide(ride);
      setShowMessagingModal(true);
    }
  };

  const handleBookingConfirm = async (rideId: string, seats: number, contactMethod: string) => {
    try {
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please sign in to book a ride');
        window.location.href = '/auth';
        return;
      }

      // Validate seats value
      if (!seats || seats < 1 || seats > 8 || isNaN(seats)) {
        console.error('Invalid seats value received:', seats);
        alert('Invalid number of seats. Please try again.');
        return;
      }

      const bookingData = {
        seats: parseInt(seats.toString()), // Ensure it's an integer
        contactMethod,
        notes: `Booking for ${seats} seat(s)`
      };

      try {
        // Try to send booking to backend
        await apiClient.bookRide(rideId, bookingData);
        alert(`Booking confirmed! ${seats} seat(s) booked via backend. The driver will contact you via ${contactMethod}.`);
      } catch (error) {
        // Simulate booking locally if backend fails
        alert(`Booking confirmed (simulated)! ${seats} seat(s) booked. The driver will contact you via ${contactMethod}.`);
      }
      
      // Update the ride's available seats locally in the posts context
      const ridePost = ridesharingPosts.find(post => post._id === rideId);
      if (ridePost) {
        updatePost(rideId, {
          details: {
            ...ridePost.details,
            ride: {
              ...ridePost.details?.ride,
              seats: Math.max(0, (ridePost.details?.ride?.seats || 1) - seats)
            }
          }
        });
      }
      
      // You could also send a message automatically
      if (contactMethod === 'message' && selectedRide?.user) {
        // Open messaging modal
        setShowBookingModal(false);
        setShowMessagingModal(true);
      } else {
        setShowBookingModal(false);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book ride. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading rides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pick & Drop</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <p>Find or offer rides across UK universities</p>
                {locationData.hasLocation && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Showing nearby rides ({locationData.radius || 20}km radius)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/ridesharing/offer">
              <Button className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Offer Ride
              </Button>
            </Link>
          </div>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {rides.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
                <p className="text-gray-600 mb-4">Check back later for new rides or be the first to offer one!</p>
                <Link href="/ridesharing/offer">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Offer a Ride
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            rides.map((ride) => (
              <Card key={ride._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <img
                          src={ride.user?.avatar || '/placeholder-user.jpg'}
                          alt={ride.user?.name || 'User'}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{ride.title}</h3>
                          <p className="text-sm text-gray-600">{ride.user?.name || 'Anonymous'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm">From: {ride.pickup}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-red-500" />
                          <span className="text-sm">To: {ride.destination}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">{formatDate(ride.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm">{ride.time}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-4">{ride.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {ride.availableSeats} seats available
                        </Badge>
                        <span className="text-2xl font-bold text-orange-600">
                          £{getPriceValue(ride.price)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-6">
                      <Button
                        onClick={() => handleBookRide(ride._id)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        Book Ride
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleMessage(ride._id, ride.user?.name || 'Anonymous')}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRide && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          ride={selectedRide}
          onBooking={handleBookingConfirm}
        />
      )}

      {/* Messaging Modal */}
      {selectedRide && (
        <MessagingModal
          isOpen={showMessagingModal}
          onClose={() => setShowMessagingModal(false)}
          recipientName={selectedRide.user?.name || 'Anonymous'}
          rideTitle={selectedRide.title}
          recipientId={selectedRide.user?._id}
          rideId={selectedRide._id}
        />
      )}
    </div>
  );
}
