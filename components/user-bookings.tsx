'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  X,
  MessageCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Booking {
  _id: string;
  ride: {
    _id: string;
    title: string;
    description: string;
    details: {
      ride: {
        from: string;
        to: string;
        date: string;
        time: string;
      };
    };
    author: {
      name: string;
      avatar?: string;
    };
  };
  seatsBooked: number;
  totalPrice: number;
  status: string;
  contactMethod: string;
  bookingDate: string;
}

export default function UserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await apiClient.getUserBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancellingId(bookingId);
    try {
      await apiClient.cancelBooking(bookingId, { 
        reason: 'Cancelled by passenger' 
      });
      
      // Update the booking status locally
      setBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast({
        title: "Cancellation failed",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status !== 'confirmed' && booking.status !== 'pending') return false;
    
    const tripDate = new Date(booking.ride.details.ride.date);
    const now = new Date();
    const hoursUntilTrip = (tripDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilTrip > 6; // Can cancel up to 6 hours before trip
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading your bookings...</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600">When you book rides, they'll appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
      
      {bookings.map((booking) => (
        <Card key={booking._id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{booking.ride.title}</h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">From: {booking.ride.details.ride.from}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    <span className="text-sm">To: {booking.ride.details.ride.to}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {new Date(booking.ride.details.ride.date).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{booking.ride.details.ride.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      £{booking.totalPrice}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <img
                      src={booking.ride.author.avatar || '/placeholder-user.jpg'}
                      alt={booking.ride.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600">
                      {booking.ride.author.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-xs text-gray-500">
                Booked on {new Date(booking.bookingDate).toLocaleDateString('en-GB')}
              </span>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <MessageCircle className="h-3 w-3" />
                  Message Driver
                </Button>
                
                {canCancelBooking(booking) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelBooking(booking._id)}
                    disabled={cancellingId === booking._id}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
