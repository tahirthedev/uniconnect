'use client';

import { useState } from 'react';
import { MapPin, Calendar, Users, Home, DollarSign, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PropertyDetailsStepProps {
  data: any;
  updateData: (updates: any) => void;
}

export default function PropertyDetailsStep({ data, updateData }: PropertyDetailsStepProps) {
  const [activeSection, setActiveSection] = useState('location');

  const handleDetailsUpdate = (field: string, value: any) => {
    updateData({
      details: {
        ...data.details,
        [field]: value,
      },
    });
  };

  const handlePricingUpdate = (field: string, value: any) => {
    updateData({
      pricing: {
        ...data.pricing,
        [field]: value,
      },
    });
  };

  const sections = [
    { id: 'location', title: 'Location', icon: MapPin },
    { id: 'availability', title: 'Availability', icon: Calendar },
    { id: 'capacity', title: 'Capacity & Size', icon: Users },
    { id: 'pricing', title: 'Pricing', icon: DollarSign },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Details & Pricing
        </h2>
        <p className="text-gray-600">
          Provide detailed information about your property
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className={activeSection === section.id ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Icon className="h-4 w-4 mr-2" />
              {section.title}
            </Button>
          );
        })}
      </div>

      {/* Location Section */}
      {activeSection === 'location' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address *
              </label>
              <textarea
                placeholder="Enter the complete address including postcode"
                value={data.details.address}
                onChange={(e) => handleDetailsUpdate('address', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit/Flat Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Flat 2B, Unit 5"
                value={data.details.unitNumber}
                onChange={(e) => handleDetailsUpdate('unitNumber', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Section */}
      {activeSection === 'availability' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available From *
                </label>
                <input
                  type="date"
                  value={data.details.availability.from}
                  onChange={(e) => 
                    handleDetailsUpdate('availability', {
                      ...data.details.availability,
                      from: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Until (Optional)
                </label>
                <input
                  type="date"
                  value={data.details.availability.to}
                  onChange={(e) => 
                    handleDetailsUpdate('availability', {
                      ...data.details.availability,
                      to: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Tenure
              </label>
              <select
                value={data.details.tenure}
                onChange={(e) => handleDetailsUpdate('tenure', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select minimum stay</option>
                <option value="1 month">1 month</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="12 months">12 months</option>
                <option value="academic year">Academic year</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capacity & Size Section */}
      {activeSection === 'capacity' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Capacity & Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Occupancy *
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.details.capacity}
                  onChange={(e) => handleDetailsUpdate('capacity', parseInt(e.target.value) || 1)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.details.bedrooms}
                  onChange={(e) => handleDetailsUpdate('bedrooms', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={data.details.bathrooms}
                  onChange={(e) => handleDetailsUpdate('bathrooms', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size (sq ft)
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.details.size}
                  onChange={(e) => handleDetailsUpdate('size', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Section */}
      {activeSection === 'pricing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rent Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="number"
                    min="0"
                    value={data.pricing.rent}
                    onChange={(e) => handlePricingUpdate('rent', parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Schedule *
                </label>
                <select
                  value={data.pricing.schedule}
                  onChange={(e) => handlePricingUpdate('schedule', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="weekly">Per Week</option>
                  <option value="monthly">Per Month</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="number"
                    min="0"
                    value={data.pricing.deposit}
                    onChange={(e) => handlePricingUpdate('deposit', parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="utilities"
                checked={data.pricing.utilitiesIncluded}
                onChange={(e) => handlePricingUpdate('utilitiesIncluded', e.target.checked)}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="utilities" className="text-sm text-gray-700">
                Utilities included in rent (electricity, water, gas, internet)
              </label>
            </div>
            
            {/* Pricing Summary */}
            {data.pricing.rent > 0 && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Pricing Summary
                </h4>
                <div className="space-y-1 text-sm text-orange-800">
                  <div className="flex justify-between">
                    <span>Rent ({data.pricing.schedule}):</span>
                    <span className="font-medium">£{data.pricing.rent}</span>
                  </div>
                  {data.pricing.deposit > 0 && (
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-medium">£{data.pricing.deposit}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-orange-200 pt-1">
                    <span>Total Move-in Cost:</span>
                    <span className="font-semibold">£{data.pricing.rent + data.pricing.deposit}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
