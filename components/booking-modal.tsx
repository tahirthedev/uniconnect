'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  X,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';

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
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  onBooking: (rideId: string, seats: number, contactMethod: string) => void;
}

export default function BookingModal({ isOpen, onClose, ride, onBooking }: BookingModalProps) {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [contactMethod, setContactMethod] = useState('message');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !ride) return null;

  const getPriceValue = (price: number | { amount: number; type: string; currency: string }): number => {
    return typeof price === 'object' ? price.amount : price;
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

  const handleConfirmBooking = async () => {
    // Validate seats before booking
    if (!selectedSeats || selectedSeats < 1 || selectedSeats > 8 || isNaN(selectedSeats)) {
      console.error('Invalid seats value:', selectedSeats);
      alert('Please select a valid number of seats (1-8)');
      return;
    }

    setLoading(true);
    try {
      await onBooking(ride._id, selectedSeats, contactMethod);
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = getPriceValue(ride.price) * selectedSeats;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Book This Ride</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Ride Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">{ride.title}</h3>
            
            <div className="space-y-2">
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

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {ride.availableSeats} seats available
              </Badge>
              <span className="text-lg font-bold text-orange-600">
                £{getPriceValue(ride.price)} per person
              </span>
            </div>
          </div>

          {/* Driver Info */}
          <div className="border-t pt-4">
            <div className="flex items-center">
              <img
                src={ride.user?.avatar || '/placeholder-user.jpg'}
                alt={ride.user?.name || 'Driver'}
                className="w-8 h-8 rounded-full mr-3"
              />
              <div>
                <p className="font-medium">{ride.user?.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-600">Driver</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Seats
              </label>
              <select
                value={selectedSeats}
                onChange={(e) => {
                  const seats = parseInt(e.target.value);
                  if (!isNaN(seats) && seats >= 1 && seats <= 8) {
                    setSelectedSeats(seats);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                {Array.from({ length: Math.min(ride.availableSeats, 8) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} seat{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How should the driver contact you?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="message"
                    checked={contactMethod === 'message'}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="mr-2"
                  />
                  <MessageCircle className="h-4 w-4 mr-1" />
                  UniConnect Messages
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="phone"
                    checked={contactMethod === 'phone'}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="mr-2"
                  />
                  <Phone className="h-4 w-4 mr-1" />
                  Phone
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={contactMethod === 'email'}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="mr-2"
                  />
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </label>
              </div>
            </div>

            {/* Total Price */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Price:</span>
                <span className="text-orange-600">£{totalPrice}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedSeats} seat{selectedSeats > 1 ? 's' : ''} × £{getPriceValue(ride.price)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By booking this ride, you agree to our terms of service and acknowledge that 
            payment arrangements are between you and the driver.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
