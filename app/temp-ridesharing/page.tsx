'use client';

import { useState, useEffect } from "react";
import { MapPin, Clock, Users, Car, Calendar, Star, Filter, Plus, MessageCircle } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RidePost {
  _id: string;
  title: string;
  description: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  availableSeats: number;
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function RidesharingPage() {
  const [rides, setRides] = useState<RidePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Sample UK ridesharing data
  const sampleRides: RidePost[] = [
    {
      _id: '1',
      title: 'Central London to UCL Campus',
      description: 'Daily commute with space for 3 passengers',
      pickup: 'Oxford Circus Station',
      destination: 'UCL Main Campus',
      date: '2025-07-06',
      time: '08:00',
      price: 8,
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
      date: '2025-07-07',
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
      date: '2025-07-06',
      time: '07:45',
      price: 12,
      availableSeats: 1,
      user: { name: 'Emma McKenzie', avatar: '/placeholder-user.jpg' },
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    setRides(sampleRides);
    setLoading(false);
  }, []);

  const handleBookRide = (rideId: string) => {
    alert(`Booking ride ${rideId}`);
  };

  const handleMessage = (rideId: string, userName: string) => {
    alert(`Messaging ${userName}`);
  };

  const filteredRides = rides.filter(ride => {
    return (
      (!filters.from || ride.pickup.toLowerCase().includes(filters.from.toLowerCase())) &&
      (!filters.to || ride.destination.toLowerCase().includes(filters.to.toLowerCase())) &&
      (!filters.date || ride.date === filters.date) &&
      (!filters.maxPrice || ride.price <= parseInt(filters.maxPrice))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ridesharing</h1>
            <p className="text-gray-600 mt-2">Find rides or offer your car space to fellow students</p>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
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
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <input
                    type="text"
                    placeholder="Pickup location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={filters.from}
                    onChange={(e) => setFilters({...filters, from: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={filters.to}
                    onChange={(e) => setFilters({...filters, to: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (£)</label>
                  <input
                    type="number"
                    placeholder="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rides List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="mt-2 text-gray-600">Loading rides...</p>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rides found matching your criteria.</p>
            </div>
          ) : (
            filteredRides.map(ride => (
              <Card key={ride._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{ride.title}</h3>
                      <p className="text-gray-600 mb-4">{ride.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{ride.pickup} → {ride.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{new Date(ride.date).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{ride.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{ride.user.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ride.availableSeats} seats available
                          </Badge>
                          <span className="text-2xl font-bold text-orange-600">£{ride.price}</span>
                        </div>
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
                        onClick={() => handleMessage(ride._id, ride.user.name)}
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
    </div>
  );
}
