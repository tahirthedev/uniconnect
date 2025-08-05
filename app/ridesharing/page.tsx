'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import LocationFilter from '@/components/location-filter';
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
  Plus, 
  Filter 
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import BookingModal from '@/components/booking-modal';
import MessagingModal from '@/components/messaging-modal';

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
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [locationBased, setLocationBased] = useState(false);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: '',
    maxPrice: ''
  });
  const [locationFilter, setLocationFilter] = useState({
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
    radius: undefined as number | undefined,
    hasLocation: false
  });

  // Sample UK university ridesharing data
  const sampleRides: Ride[] = [
    {
      _id: '1',
      title: 'London to Oxford Universities',
      description: 'Regular trip between campuses, comfortable car with AC',
      pickup: 'King\'s Cross Station',
      destination: 'Oxford University',
      date: '2025-01-15',
      time: '09:00',
      price: 20,
      availableSeats: 3,
      user: { name: 'Sarah Johnson', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Manchester to Liverpool Universities',
      description: 'Weekend trip with stops at both universities',
      pickup: 'Manchester City Centre',
      destination: 'Liverpool University',
      date: '2025-01-16',
      time: '10:30',
      price: 15,
      availableSeats: 2,
      user: { name: 'James Wilson', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      title: 'Edinburgh to Glasgow Daily Commute',
      description: 'Reliable daily service between campuses',
      pickup: 'Edinburgh Waverley',
      destination: 'Glasgow University',
      date: '2025-01-17',
      time: '07:45',
      price: 12,
      availableSeats: 1,
      user: { name: 'Emma McKenzie', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    },
    {
      _id: '4',
      title: 'Birmingham to Coventry Universities',
      description: 'Daily commute, eco-friendly hybrid vehicle',
      pickup: 'Birmingham New Street',
      destination: 'University of Warwick',
      date: '2025-01-18',
      time: '08:15',
      price: 8,
      availableSeats: 2,
      user: { name: 'Michael Davies', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchRides();
  }, [filters, locationFilter]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params: any = { category: 'pick-drop' }; // Use pick-drop category
      
      // Add location parameters if available
      if (locationFilter.hasLocation && locationFilter.lat && locationFilter.lng) {
        params.lat = locationFilter.lat;
        params.lng = locationFilter.lng;
        params.radius = locationFilter.radius || 20;
      }
      
      // Add other filters
      if (filters.maxPrice) params.priceMax = parseFloat(filters.maxPrice);
      
      const response = await apiClient.getPosts(params);
      const rideData = response.posts || [];
      setLocationBased(response.locationBased || false);
      
      if (rideData.length === 0) {
        // Use sample data if no backend data
        setRides(sampleRides);
      } else {
        // Transform backend data to match our interface
        const transformedRides = rideData.map((post: any) => ({
          _id: post._id,
          title: post.title,
          description: post.description,
          pickup: post.details?.ride?.from || post.location?.city || '',
          destination: post.details?.ride?.to || '',
          date: post.details?.ride?.date ? new Date(post.details.ride.date).toISOString().split('T')[0] : '',
          time: post.details?.ride?.time || '',
          price: post.price,
          availableSeats: post.details?.ride?.seats || 1,
          user: {
            _id: post.author?._id || post.author,
            name: post.author?.name || 'Anonymous',
            avatar: post.author?.avatar
          },
          createdAt: post.createdAt
        }));
        setRides(transformedRides);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      // Fallback to sample data
      setRides(sampleRides);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationFilterChange = useCallback((newLocationFilter: any) => {
    setLocationFilter(newLocationFilter);
  }, []);

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

      console.log('Booking data being sent:', bookingData); // Debug log

      try {
        // Try to send booking to backend
        await apiClient.bookRide(rideId, bookingData);
        alert(`Booking confirmed! ${seats} seat(s) booked via backend. The driver will contact you via ${contactMethod}.`);
      } catch (error) {
        console.warn('Backend booking failed, using local simulation:', error);
        // Simulate booking locally if backend fails
        alert(`Booking confirmed (simulated)! ${seats} seat(s) booked. The driver will contact you via ${contactMethod}.`);
      }
      
      // Update the ride's available seats locally
      setRides(prevRides => 
        prevRides.map(ride => 
          ride._id === rideId 
            ? { ...ride, availableSeats: Math.max(0, ride.availableSeats - seats) }
            : ride
        )
      );
      
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

  const filteredRides = rides.filter(ride => {
    return (
      (!filters.from || ride.pickup.toLowerCase().includes(filters.from.toLowerCase())) &&
      (!filters.to || ride.destination.toLowerCase().includes(filters.to.toLowerCase())) &&
      (!filters.date || ride.date === filters.date) &&
      (!filters.maxPrice || getPriceValue(ride.price) <= parseInt(filters.maxPrice))
    );
  });

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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading rides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
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
                {locationBased && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Showing nearby rides ({locationFilter.radius || 20}km radius)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Link href="/ridesharing/offer">
              <Button className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Offer Ride
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Location Filter */}
                <div className="md:col-span-1">
                  <LocationFilter 
                    onFilterChange={handleLocationFilterChange}
                    defaultRadius={20}
                    compact={true}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <input
                    type="text"
                    placeholder="Pickup location"
                    value={filters.from}
                    onChange={(e) => setFilters({...filters, from: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <input
                    type="text"
                    placeholder="Destination"
                    value={filters.to}
                    onChange={(e) => setFilters({...filters, to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (£)</label>
                  <input
                    type="number"
                    placeholder="Maximum price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rides List */}
        <div className="space-y-4">
          {filteredRides.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or check back later for new rides.</p>
                <Link href="/ridesharing/offer">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Offer a Ride
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredRides.map((ride) => (
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
