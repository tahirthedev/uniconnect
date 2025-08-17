'use client';

import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Home, DollarSign, Calculator, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PropertyDetailsStepProps {
  data: any;
  updateData: (updates: any) => void;
  validationErrors?: string[];
}

export default function PropertyDetailsStep({ data, updateData, validationErrors = [] }: PropertyDetailsStepProps) {
  const [activeSection, setActiveSection] = useState('location');
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Auto-navigate to next incomplete section when validation errors occur
  useEffect(() => {
    if (validationErrors.length > 0) {
      const nextSection = getNextIncompleteSection();
      if (nextSection && nextSection !== activeSection) {
        setActiveSection(nextSection);
        // Scroll to top of the step to show the new section
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [validationErrors]);

  // Check section completion
  const checkSectionCompletion = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'location':
        return !!(data.details.address && data.details.city);
      case 'availability':
        return !!(data.details.availability.from && data.details.tenure);
      case 'capacity':
        return !!(data.details.capacity > 0 && data.details.bedrooms > 0 && data.details.bathrooms > 0);
      case 'pricing':
        return !!(data.pricing.rent > 0 && data.pricing.deposit >= 0);
      default:
        return false;
    }
  };

  // Update completed sections when data changes
  useEffect(() => {
    const completed = sections.filter(section => checkSectionCompletion(section.id));
    setCompletedSections(completed.map(s => s.id));
  }, [data]);

  // Get next incomplete section
  const getNextIncompleteSection = (): string | null => {
    const incomplete = sections.find(section => !checkSectionCompletion(section.id));
    return incomplete?.id || null;
  };

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
    { id: 'location', title: 'Location', icon: MapPin, required: true },
    { id: 'availability', title: 'Availability', icon: Calendar, required: true },
    { id: 'capacity', title: 'Capacity & Size', icon: Users, required: true },
    { id: 'pricing', title: 'Pricing', icon: DollarSign, required: true },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Details & Pricing
        </h2>
        <p className="text-gray-600">
          Provide detailed information about your property. Complete all sections to proceed.
        </p>
        
        {/* Progress Indicator */}
        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-orange-800">
              Progress: {completedSections.length} of {sections.length} sections completed
            </span>
            <Badge variant={completedSections.length === sections.length ? "default" : "secondary"}>
              {completedSections.length === sections.length ? "All Complete!" : "In Progress"}
            </Badge>
          </div>
          <div className="mt-2 w-full bg-orange-100 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(completedSections.length / sections.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Next Steps Alert */}
        {completedSections.length > 0 && completedSections.length < sections.length && (
          <Alert className="mt-4 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Next:</strong> Complete the remaining sections, then proceed to the{' '}
              <span className="font-semibold">Amenities</span> step to continue your listing.
            </AlertDescription>
          </Alert>
        )}

        {completedSections.length === sections.length && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Great!</strong> All property details completed. You can now proceed to the next step using the Next button below.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const isCompleted = completedSections.includes(section.id);
          const isActive = activeSection === section.id;
          
          return (
            <Button
              key={section.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className={`relative ${
                isActive 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : isCompleted 
                    ? 'border-green-500 text-green-700 hover:bg-green-50' 
                    : ''
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {section.title}
              {isCompleted && (
                <CheckCircle className="h-3 w-3 ml-2 text-green-600" />
              )}
              {section.required && !isCompleted && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
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
                placeholder="Enter the complete address including postcode (e.g., 123 Oxford Street, Manchester M1 4PD)"
                value={data.details.address}
                onChange={(e) => handleDetailsUpdate('address', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  validationErrors.includes('address') 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                rows={3}
              />
              {validationErrors.includes('address') && (
                <p className="text-sm text-red-600 mt-1">Address is required</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                This will be used for precise location mapping
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                placeholder="e.g., Manchester, Birmingham, Leeds"
                value={data.details.city}
                onChange={(e) => handleDetailsUpdate('city', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  validationErrors.includes('city') 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              {validationErrors.includes('city') && (
                <p className="text-sm text-red-600 mt-1">City is required</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed publicly and used for search filtering
              </p>
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
            
            {/* Section Completion Prompt */}
            {checkSectionCompletion('location') && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Location details completed!</span>
                </div>
              </div>
            )}
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
                Minimum Tenure *
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
            
            {/* Section Completion Prompt */}
            {checkSectionCompletion('availability') && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Availability details completed!</span>
                </div>
              </div>
            )}
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
            
            {/* Section Completion Prompt */}
            {checkSectionCompletion('capacity') && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Capacity details completed!</span>
                </div>
              </div>
            )}
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
                    className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.includes('rent') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="500"
                  />
                </div>
                {validationErrors.includes('rent') && (
                  <p className="text-sm text-red-600 mt-1">Rent amount is required and must be greater than 0</p>
                )}
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
                    className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.includes('deposit') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="500"
                  />
                </div>
                {validationErrors.includes('deposit') && (
                  <p className="text-sm text-red-600 mt-1">Deposit must be 0 or greater</p>
                )}
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
            
            {/* Section Completion Prompt */}
            {checkSectionCompletion('pricing') && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Pricing details completed!</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
