'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Car,
  Phone,
  Mail
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function OfferRidePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickup: '',
    destination: '',
    date: '',
    time: '',
    price: '',
    availableSeats: 1,
    contactMethod: 'message', // 'message', 'phone', 'email'
    phone: '',
    email: ''
  });
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

  // Real-time field validation
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title':
        if (!value) return 'Title is required';
        if (value.length < 5) return 'Title must be at least 5 characters';
        if (value.length > 200) return 'Title must be less than 200 characters';
        return '';
      case 'description':
        if (!value) return 'Description is required';
        if (value.length < 10) return 'Description must be at least 10 characters';
        if (value.length > 2000) return 'Description must be less than 2000 characters';
        return '';
      case 'pickup':
        if (!value) return 'Pickup location is required';
        if (value.length < 2) return 'Pickup location must be at least 2 characters';
        return '';
      case 'destination':
        if (!value) return 'Destination is required';
        if (value.length < 2) return 'Destination must be at least 2 characters';
        return '';
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Date cannot be in the past';
        return '';
      case 'time':
        if (!value) return 'Time is required';
        return '';
      case 'price':
        if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
          return 'Price must be a valid positive number';
        }
        return '';
      case 'phone':
        if (formData.contactMethod === 'phone' && !value) {
          return 'Phone number is required for phone contact';
        }
        if (value && !/^[\d\s\+\-\(\)]+$/.test(value)) {
          return 'Please enter a valid phone number';
        }
        return '';
      case 'email':
        if (formData.contactMethod === 'email' && !value) {
          return 'Email is required for email contact';
        }
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    if (!formData.title || formData.title.length < 5) {
      return 'Title is required (min 5 characters).';
    }
    if (!formData.description || formData.description.length < 10) {
      return 'Description is required (min 10 characters).';
    }
    if (!formData.pickup || formData.pickup.length < 2) {
      return 'Pickup location is required (min 2 characters).';
    }
    if (!formData.destination || formData.destination.length < 2) {
      return 'Destination is required (min 2 characters).';
    }
    if (!formData.date || isNaN(Date.parse(formData.date))) {
      return 'A valid date is required.';
    }
    if (!formData.time) {
      return 'Time is required.';
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      return 'A valid price is required.';
    }
    if (!formData.availableSeats || isNaN(Number(formData.availableSeats)) || Number(formData.availableSeats) < 1) {
      return 'Available seats must be at least 1.';
    }
    if (formData.contactMethod === 'phone' && !formData.phone) {
      return 'Phone number is required for phone contact.';
    }
    if (formData.contactMethod === 'email' && !formData.email) {
      return 'Email is required for email contact.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please sign in to offer a ride');
        window.location.href = '/auth';
        return;
      }

      // Create the ride post
      const contact: any = { preferredMethod: formData.contactMethod };
      if (formData.contactMethod === 'phone') contact.phone = formData.phone;
      if (formData.contactMethod === 'email') contact.email = formData.email;

      const postData: any = {
        title: formData.title,
        description: formData.description,
        category: 'ridesharing',
        location: {
          city: formData.pickup, // Use pickup as city for now
          state: 'UK',
          country: 'United Kingdom'
        },
        details: {
          ride: {
            from: formData.pickup,
            to: formData.destination,
            date: formData.date, // Send as string instead of Date object
            time: formData.time,
            seats: parseInt(formData.availableSeats.toString()),
            recurring: false
          }
        },
        contact
      };

      // Only include price if it's provided and valid
      if (formData.price && !isNaN(parseFloat(formData.price))) {
        postData.price = {
          amount: parseFloat(formData.price),
          type: 'fixed',
          currency: 'GBP'
        };
      }

      await apiClient.createPost(postData);

      alert('Ride offer posted successfully!');
      window.location.href = '/ridesharing';

    } catch (error: any) {
      console.error('Error posting ride:', error);
      
      // Handle different types of errors
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Validation errors from express-validator
          const validationMessages = errorData.errors.map((err: any) => err.msg).join(', ');
          setFormError(`Validation errors: ${validationMessages}`);
        } else if (errorData.message) {
          setFormError(errorData.message);
        } else {
          setFormError('Failed to post ride. Please try again.');
        }
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError('Failed to post ride. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation
    if (fieldTouched[name]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Form field component for consistent styling and validation
  const FormField = ({ 
    label, 
    name, 
    type = 'text', 
    placeholder, 
    required = false, 
    maxLength, 
    showCharCount = false,
    helpText,
    children 
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    showCharCount?: boolean;
    helpText?: string;
    children?: React.ReactNode;
  }) => {
    const hasError = fieldErrors[name] && fieldTouched[name];
    const isValid = fieldTouched[name] && !fieldErrors[name] && formData[name as keyof typeof formData];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children || (
          type === 'textarea' ? (
            <textarea
              name={name}
              value={formData[name as keyof typeof formData] as string}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                hasError 
                  ? 'border-red-300 focus:border-red-500' 
                  : isValid 
                  ? 'border-green-300 focus:border-green-500'
                  : 'border-gray-300 focus:border-orange-500'
              }`}
              required={required}
            />
          ) : (
            <input
              type={type}
              name={name}
              value={formData[name as keyof typeof formData] as string}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              maxLength={maxLength}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-colors ${
                hasError 
                  ? 'border-red-300 focus:border-red-500' 
                  : isValid 
                  ? 'border-green-300 focus:border-green-500'
                  : 'border-gray-300 focus:border-orange-500'
              }`}
              required={required}
            />
          )
        )}
        
        <div className="mt-1 flex justify-between items-start">
          <div className="flex-1">
            {hasError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block w-4 h-4 text-red-500">⚠</span>
                {fieldErrors[name]}
              </p>
            )}
            {isValid && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <span className="inline-block w-4 h-4 text-green-500">✓</span>
                Looks good!
              </p>
            )}
            {helpText && !hasError && !isValid && (
              <p className="text-sm text-gray-500">{helpText}</p>
            )}
          </div>
          {showCharCount && maxLength && (
            <span className={`text-xs ${
              (formData[name as keyof typeof formData] as string).length > maxLength * 0.9 
                ? 'text-orange-600' 
                : 'text-gray-400'
            }`}>
              {(formData[name as keyof typeof formData] as string).length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <FormField
                label="Ride Title"
                name="title"
                placeholder="e.g., Daily commute from London to Oxford University"
                required
                maxLength={200}
                showCharCount
                helpText="Be specific about your route - include major landmarks or areas"
              />

              {/* Description */}
              <FormField
                label="Description"
                name="description"
                type="textarea"
                placeholder="Describe your ride: departure time, car type, any stops, passenger preferences, etc."
                required
                maxLength={2000}
                showCharCount
                helpText="Provide details that help passengers decide if this ride suits them"
              />

              {/* Pickup and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Pickup Location"
                  name="pickup"
                  placeholder="e.g., London King's Cross Station"
                  required
                  helpText="Be as specific as possible"
                >
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="pickup"
                      value={formData.pickup}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., London King's Cross Station"
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
                </FormField>

                <FormField
                  label="Destination"
                  name="destination"
                  placeholder="e.g., Oxford University, Carfax Tower"
                  required
                  helpText="Include specific area or landmark"
                >
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., Oxford University, Carfax Tower"
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
                </FormField>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Date"
                  name="date"
                  type="date"
                  required
                  helpText="Select departure date"
                >
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
                </FormField>

                <FormField
                  label="Departure Time"
                  name="time"
                  type="time"
                  required
                  helpText="When will you leave?"
                >
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
                </FormField>
              </div>
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Price and Seats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Price per person (£) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                    min="0"
                    step="0.50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline h-4 w-4 mr-1" />
                    Available Seats *
                  </label>
                  <select
                    name="availableSeats"
                    value={formData.availableSeats}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    required
                  >
                    <option value={1}>1 seat</option>
                    <option value={2}>2 seats</option>
                    <option value={3}>3 seats</option>
                    <option value={4}>4 seats</option>
                    <option value={5}>5 seats</option>
                    <option value={6}>6 seats</option>
                    <option value={7}>7 seats</option>
                  </select>
                </div>
              </div>

              {/* Contact Method */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method
              </label>
              <select
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="message">UniConnect Messages</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
              </select>
              {formData.contactMethod === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., +44 1234 567890"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
              )}
              {formData.contactMethod === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., you@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/ridesharing">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post Ride'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Tips for a Great Ride Post</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Be specific about pickup and drop-off locations</li>
              <li>• Mention any stops or detours you plan to make</li>
              <li>• Set a fair price based on distance and fuel costs</li>
              <li>• Be clear about your expectations (punctuality, no smoking, etc.)</li>
              <li>• Consider offering regular rides for recurring journeys</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
