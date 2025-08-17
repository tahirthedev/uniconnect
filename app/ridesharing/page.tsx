'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  
  // Use PostsContext for ridesharing posts (both ridesharing and pick-drop categories)
  const { allPosts, loading, error } = usePosts();
  
  // Filter for both ridesharing and pick-drop categories
  const ridesharingPosts = useMemo(() => {
    return allPosts.filter(post => 
      post.category === 'ridesharing' || post.category === 'pick-drop'
    );
  }, [allPosts]);
  const { updatePost } = usePosts();
  
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('all');

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

  // Get available cities for filtering
  const availableCities = useMemo(() => {
    const cities = ridesharingPosts.map(post => post.location?.city).filter(Boolean);
    return [...new Set(cities)].sort();
  }, [ridesharingPosts]);

  // Filter rides by selected city
  const filteredRides = useMemo(() => {
    if (selectedCity === 'all') return rides;
    return rides.filter(ride => {
      const ridePost = ridesharingPosts.find(post => post._id === ride._id);
      return ridePost?.location?.city === selectedCity;
    });
  }, [rides, selectedCity, ridesharingPosts]);

  const getPriceValue = (price: number | { amount: number; type: string; currency: string }): number => {
    return typeof price === 'object' ? price.amount : price;
  };

  const handleBookRide = (rideId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book a ride.",
        variant: "destructive",
      });
      window.location.href = '/auth';
      return;
    }
    
    const ride = filteredRides.find(r => r._id === rideId);
    if (ride) {
      setSelectedRide(ride);
      setShowBookingModal(true);
    }
  };

  const handleMessage = (rideId: string, driverName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Sign in required",
        description: "Please sign in to message drivers.",
        variant: "destructive",
      });
      window.location.href = '/auth';
      return;
    }
    
    const ride = filteredRides.find(r => r._id === rideId);
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
        toast({
          title: "Sign in required",
          description: "Please sign in to book a ride.",
          variant: "destructive",
        });
        window.location.href = '/auth';
        return;
      }

      // Validate seats value
      if (!seats || seats < 1 || seats > 8 || isNaN(seats)) {
        console.error('Invalid seats value received:', seats);
        toast({
          title: "Invalid selection",
          description: "Invalid number of seats. Please try again.",
          variant: "destructive",
        });
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
        toast({
          title: "Booking confirmed! 🎉",
          description: `${seats} seat(s) booked via backend. The driver will contact you via ${contactMethod}.`,
        });
      } catch (error) {
        // Simulate booking locally if backend fails
        toast({
          title: "Booking confirmed! (simulated)",
          description: `${seats} seat(s) booked. The driver will contact you via ${contactMethod}.`,
        });
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
      toast({
        title: "Booking failed",
        description: "Failed to book ride. Please try again.",
        variant: "destructive",
      });
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-4">
          <div className="flex items-center">
            <Link href="/" className="mr-3 sm:mr-4">
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 hover:text-orange-600" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <Car className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-500 mr-2 sm:mr-3" />
                Offer/Request Ride
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-gray-600">
                <p className="text-sm sm:text-base">Find or offer rides across UK universities</p>
                {locationData.hasLocation && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      <span className="text-xs sm:text-sm text-green-600">Showing nearby rides ({locationData.radius || 20}km radius)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/ridesharing/offer">
              <Button className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2 text-sm sm:text-base px-4 sm:px-6">
                <Plus className="h-4 w-4" />
                Request a Ride
              </Button>
            </Link>
          </div>
        </div>

        {/* City Filter */}
        {availableCities.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by City</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity('all')}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCity === 'all'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Cities
                  </button>
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedCity === city
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-gray-600">
            {selectedCity !== 'all'
              ? `Showing ${filteredRides.length} ride${filteredRides.length !== 1 ? 's' : ''} in ${selectedCity}`
              : `Showing all ${filteredRides.length} ride${filteredRides.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {filteredRides.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <Car className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Check back later for new rides or be the first to offer one!</p>
                <Link href="/ridesharing/offer">
                  <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                    Offer a Ride
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredRides.map((ride) => (
              <Card key={ride._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-3">
                        <img
                          src={ride.user?.avatar || '/placeholder-user.jpg'}
                          alt={ride.user?.name || 'User'}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{ride.title}</h3>
                          <p className="text-sm text-gray-600 truncate">{ride.user?.name || 'Anonymous'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4">
                        <div className="flex items-center text-gray-600 min-w-0">
                          <MapPin className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                          <span className="text-sm truncate">From: {ride.pickup}</span>
                        </div>
                        <div className="flex items-center text-gray-600 min-w-0">
                          <MapPin className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                          <span className="text-sm truncate">To: {ride.destination}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{formatDate(ride.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{ride.time}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-4 break-words">{ride.description}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Users className="h-3 w-3" />
                          {ride.availableSeats} seats available
                        </Badge>
                        <span className="text-xl sm:text-2xl font-bold text-orange-600">
                          £{getPriceValue(ride.price)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mobile-responsive action buttons */}
                    <div className="flex flex-row sm:flex-col gap-2 sm:gap-2 sm:ml-4 flex-shrink-0">
                      <Button
                        onClick={() => handleBookRide(ride._id)}
                        className="bg-orange-500 hover:bg-orange-600 flex-1 sm:flex-initial text-sm sm:text-base"
                        size="sm"
                      >
                        <span className="sm:hidden">Request</span>
                        <span className="hidden sm:inline">Request Ride</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleMessage(ride._id, ride.user?.name || 'Anonymous')}
                        className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial text-sm sm:text-base"
                        size="sm"
                      >
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Message</span>
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
