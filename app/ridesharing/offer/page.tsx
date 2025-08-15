'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import LocationSelector from '@/components/location-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Car,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { ApiClient } from '@/lib/api';

const apiClient = new ApiClient();

export default function OfferRidePage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickup: '',
    destination: '',
    date: '',
    time: '',
    price: '',
    availableSeats: 1,
    contactMethod: 'message',
    phone: '',
    email: ''
  });
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError('Please sign in to offer a ride. You will be redirected to the login page.');
    }
  }, []);
  // Validation function
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title':
        if (!value || value.length < 5 || value.length > 200) {
          return 'Title must be between 5 and 200 characters';
        }
        return '';
      case 'description':
        if (!value || value.length < 10 || value.length > 2000) {
          return 'Description must be between 10 and 2000 characters';
        }
        return '';
      case 'pickup':
        if (!value || value.length < 2 || value.length > 100) {
          return 'Pickup location must be between 2 and 100 characters';
        }
        return '';
      case 'destination':
        if (!value || value.length < 2 || value.length > 100) {
          return 'Destination must be between 2 and 100 characters';
        }
        return '';
      case 'date':
        if (!value) return 'Date is required';
        return '';
      case 'time':
        if (!value) return 'Time is required';
        return '';
      case 'phone':
        if (formData.contactMethod === 'phone' && !value) {
          return 'Phone number is required for phone contact';
        }
        return '';
      case 'email':
        if (formData.contactMethod === 'email' && !value) {
          return 'Email is required for email contact';
        }
        return '';
      default:
        return '';
    }
  };

  // Handle input changes - simple function without useCallback
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      return newData;
    });

    // Clear field error
    setFieldErrors(prev => {
      if (prev[name]) {
        return { ...prev, [name]: '' };
      }
      return prev;
    });
  };

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormError(null);
    setLoading(true);

    // Basic validation
    const requiredFields = ['title', 'description', 'pickup', 'destination', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      setFormError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // Contact method validation
    if (formData.contactMethod === 'phone' && !formData.phone) {
      setFormError('Phone number is required when phone is selected as contact method');
      setLoading(false);
      return;
    }

    if (formData.contactMethod === 'email' && !formData.email) {
      setFormError('Email is required when email is selected as contact method');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Sign in required",
          description: "Please sign in to offer a ride.",
          variant: "destructive",
        });
        window.location.href = '/auth';
        return;
      }

      // Prepare contact info
      const contact: any = { 
        preferredMethod: formData.contactMethod 
      };
      
      if (formData.contactMethod === 'phone') {
        contact.phone = formData.phone;
      }
      
      if (formData.contactMethod === 'email') {
        contact.email = formData.email;
      }

      // Prepare post data
      const postData: any = {
        title: formData.title,
        description: formData.description,
        category: 'pick-drop', // Updated category name
        location: location ? {
          city: location.city,
          state: location.state || '',
          country: location.country || 'UK',
          coordinates: location.coordinates || null
        } : {
          city: formData.pickup,
          state: 'UK',
          country: 'United Kingdom'
        },
        details: {
          ride: {
            from: formData.pickup,
            to: formData.destination,
            date: formData.date,
            time: formData.time,
            seats: parseInt(formData.availableSeats.toString()),
            recurring: false
          }
        },
        contact
      };

      // Add price if provided
      if (formData.price && parseFloat(formData.price) > 0) {
        postData.price = {
          amount: parseFloat(formData.price),
          type: 'fixed',
          currency: 'GBP'
        };
      }

      await apiClient.createPost(postData);

      toast({
        title: "Ride offer created! 🎉",
        description: "Your ride offer is now live and visible to students.",
      });
      window.location.href = '/ridesharing';
      
    } catch (error: any) {
      console.error('Error posting ride:', error);
      setFormError('Failed to create ride offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/ridesharing" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offer a Ride</h1>
            <p className="text-gray-600">Share your journey with fellow students</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-orange-600" />
              Ride Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                  {authError}
                  <Link href="/auth" className="underline ml-2">Go to login</Link>
                </div>
              )}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ride Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Daily commute from London to Oxford University"
                  maxLength={200}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                    fieldErrors.title && fieldTouched.title
                      ? 'border-red-300 focus:border-red-500' 
                      : fieldTouched.title && !fieldErrors.title && formData.title
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-300 focus:border-orange-500'
                  }`}
                  required
                />
                <div className="mt-1 flex justify-between items-start">
                  <div className="flex-1">
                    {fieldErrors.title && fieldTouched.title && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.title}
                      </p>
                    )}
                    {fieldTouched.title && !fieldErrors.title && formData.title && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.title && !fieldTouched.title && (
                      <p className="text-sm text-gray-500">Be specific about your route - include major landmarks or areas</p>
                    )}
                  </div>
                  <span className={`text-xs ${
                    formData.title.length > 200 * 0.9 
                      ? 'text-orange-600' 
                      : 'text-gray-400'
                  }`}>
                    {formData.title.length}/200
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Describe your ride: departure time, car type, any stops, passenger preferences, etc."
                  maxLength={2000}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                    fieldErrors.description && fieldTouched.description
                      ? 'border-red-300 focus:border-red-500' 
                      : fieldTouched.description && !fieldErrors.description && formData.description
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-300 focus:border-orange-500'
                  }`}
                  required
                />
                <div className="mt-1 flex justify-between items-start">
                  <div className="flex-1">
                    {fieldErrors.description && fieldTouched.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.description}
                      </p>
                    )}
                    {fieldTouched.description && !fieldErrors.description && formData.description && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.description && !fieldTouched.description && (
                      <p className="text-sm text-gray-500">Provide details that help passengers decide if this ride suits them</p>
                    )}
                  </div>
                  <span className={`text-xs ${
                    formData.description.length > 2000 * 0.9 
                      ? 'text-orange-600' 
                      : 'text-gray-400'
                  }`}>
                    {formData.description.length}/2000
                  </span>
                </div>
              </div>

              {/* Location Selector */}
              <div>
                <LocationSelector
                  onLocationSelect={setLocation}
                  defaultLocation={location}
                  showMap={false}
                  compact={false}
                  required={false}
                />
              </div>

              {/* Pickup and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="pickup"
                      value={formData.pickup}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., London King's Cross Station"
                      maxLength={100}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                        fieldErrors.pickup && fieldTouched.pickup
                          ? 'border-red-300 focus:border-red-500' 
                          : fieldTouched.pickup && !fieldErrors.pickup && formData.pickup
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-300 focus:border-orange-500'
                      }`}
                      required
                    />
                  </div>
                  <div className="mt-1">
                    {fieldErrors.pickup && fieldTouched.pickup && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.pickup}
                      </p>
                    )}
                    {fieldTouched.pickup && !fieldErrors.pickup && formData.pickup && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.pickup && !fieldTouched.pickup && (
                      <p className="text-sm text-gray-500">Be as specific as possible</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., Oxford University, Carfax Tower"
                      maxLength={100}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                        fieldErrors.destination && fieldTouched.destination
                          ? 'border-red-300 focus:border-red-500' 
                          : fieldTouched.destination && !fieldErrors.destination && formData.destination
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-300 focus:border-orange-500'
                      }`}
                      required
                    />
                  </div>
                  <div className="mt-1">
                    {fieldErrors.destination && fieldTouched.destination && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.destination}
                      </p>
                    )}
                    {fieldTouched.destination && !fieldErrors.destination && formData.destination && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.destination && !fieldTouched.destination && (
                      <p className="text-sm text-gray-500">Include specific area or landmark</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                        fieldErrors.date && fieldTouched.date
                          ? 'border-red-300 focus:border-red-500' 
                          : fieldTouched.date && !fieldErrors.date && formData.date
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-300 focus:border-orange-500'
                      }`}
                      required
                    />
                  </div>
                  <div className="mt-1">
                    {fieldErrors.date && fieldTouched.date && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.date}
                      </p>
                    )}
                    {fieldTouched.date && !fieldErrors.date && formData.date && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.date && !fieldTouched.date && (
                      <p className="text-sm text-gray-500">Select departure date</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                        fieldErrors.time && fieldTouched.time
                          ? 'border-red-300 focus:border-red-500' 
                          : fieldTouched.time && !fieldErrors.time && formData.time
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-300 focus:border-orange-500'
                      }`}
                      required
                    />
                  </div>
                  <div className="mt-1">
                    {fieldErrors.time && fieldTouched.time && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.time}
                      </p>
                    )}
                    {fieldTouched.time && !fieldErrors.time && formData.time && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.time && !fieldTouched.time && (
                      <p className="text-sm text-gray-500">When will you leave?</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price and Seats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per seat (optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="15.00"
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                        fieldErrors.price && fieldTouched.price
                          ? 'border-red-300 focus:border-red-500' 
                          : fieldTouched.price && !fieldErrors.price
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-300 focus:border-orange-500'
                      }`}
                    />
                  </div>
                  <div className="mt-1">
                    {fieldErrors.price && fieldTouched.price && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.price}
                      </p>
                    )}
                    {fieldTouched.price && !fieldErrors.price && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.price && !fieldTouched.price && (
                      <p className="text-sm text-gray-500">Leave empty for free rides</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      name="availableSeats"
                      value={formData.availableSeats}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                        fieldErrors.availableSeats && fieldTouched.availableSeats
                          ? 'border-red-300 focus:border-red-500' 
                          : fieldTouched.availableSeats && !fieldErrors.availableSeats
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-300 focus:border-orange-500'
                      }`}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          {num} seat{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-1">
                    {fieldErrors.availableSeats && fieldTouched.availableSeats && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.availableSeats}
                      </p>
                    )}
                    {fieldTouched.availableSeats && !fieldErrors.availableSeats && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.availableSeats && !fieldTouched.availableSeats && (
                      <p className="text-sm text-gray-500">How many passengers can you take?</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How should passengers contact you? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="message"
                      checked={formData.contactMethod === 'message'}
                      onChange={handleChange}
                      className="mr-3 h-4 w-4 text-orange-600"
                    />
                    <MessageCircle className="h-4 w-4 mr-2 text-gray-600" />
                    <div>
                      <div className="font-medium">Platform Messages</div>
                      <div className="text-sm text-gray-500">Use our secure messaging system</div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="phone"
                      checked={formData.contactMethod === 'phone'}
                      onChange={handleChange}
                      className="mr-3 h-4 w-4 text-orange-600"
                    />
                    <Phone className="h-4 w-4 mr-2 text-gray-600" />
                    <div>
                      <div className="font-medium">Phone Call/SMS</div>
                      <div className="text-sm text-gray-500">Share your phone number</div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="email"
                      checked={formData.contactMethod === 'email'}
                      onChange={handleChange}
                      className="mr-3 h-4 w-4 text-orange-600"
                    />
                    <Mail className="h-4 w-4 mr-2 text-gray-600" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-gray-500">Share your email address</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Conditional Contact Fields */}
              {formData.contactMethod === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+44 7XXX XXX XXX"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                      fieldErrors.phone && fieldTouched.phone
                        ? 'border-red-300 focus:border-red-500' 
                        : fieldTouched.phone && !fieldErrors.phone && formData.phone
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-300 focus:border-orange-500'
                    }`}
                    required
                  />
                  <div className="mt-1">
                    {fieldErrors.phone && fieldTouched.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.phone}
                      </p>
                    )}
                    {fieldTouched.phone && !fieldErrors.phone && formData.phone && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.phone && !fieldTouched.phone && (
                      <p className="text-sm text-gray-500">This will be shared with passengers who book your ride</p>
                    )}
                  </div>
                </div>
              )}

              {formData.contactMethod === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="your.email@university.ac.uk"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                      fieldErrors.email && fieldTouched.email
                        ? 'border-red-300 focus:border-red-500' 
                        : fieldTouched.email && !fieldErrors.email && formData.email
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-300 focus:border-orange-500'
                    }`}
                    required
                  />
                  <div className="mt-1">
                    {fieldErrors.email && fieldTouched.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                        {fieldErrors.email}
                      </p>
                    )}
                    {fieldTouched.email && !fieldErrors.email && formData.email && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-green-500">✓</span>
                        Looks good!
                      </p>
                    )}
                    {!fieldErrors.email && !fieldTouched.email && (
                      <p className="text-sm text-gray-500">This will be shared with passengers who book your ride</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Ride...
                    </div>
                  ) : (
                    'Create Ride Offer'
                  )}
                </Button>
                
                {Object.values(fieldErrors).some(error => error !== '') && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Please fix the errors above before submitting
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Helpful Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Tips for a Great Ride Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <p><strong>Be specific with locations:</strong> Include landmarks, station names, or well-known areas to help passengers find you easily.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <p><strong>Set fair prices:</strong> Consider fuel costs, tolls, and wear on your vehicle. Most rides cost £3-8 per person for short distances.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <p><strong>Communicate clearly:</strong> Mention any stops, music preferences, or luggage limitations in your description.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <p><strong>Be reliable:</strong> Only post rides you're committed to. Passengers may plan their day around your schedule.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
