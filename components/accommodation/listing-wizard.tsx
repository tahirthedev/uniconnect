'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import StepIndicator from '@/components/accommodation/step-indicator';
import PropertyTypeStep from '@/components/accommodation/steps/property-type-step';
import PropertyDetailsStep from '@/components/accommodation/steps/property-details-step';
import AmenitiesStep from '@/components/accommodation/steps/amenities-step';
import PreferencesStep from '@/components/accommodation/steps/preferences-step';
import DescriptionStep from '@/components/accommodation/steps/description-step';
import SummaryStep from '@/components/accommodation/steps/summary-step';
import { apiClient } from '@/lib/api';

interface PropertyListing {
  // Step 1: Property Type
  type: 'entire-place' | 'private-room' | 'shared-room' | 'roommate-wanted' | '';
  
  // Step 2: Property Details
  details: {
    address: string;
    unitNumber: string;
    availability: {
      from: string;
      to: string;
    };
    capacity: number;
    bedrooms: number;
    bathrooms: number;
    size: number;
    tenure: string;
  };
  
  // Step 2: Pricing
  pricing: {
    rent: number;
    deposit: number;
    schedule: 'weekly' | 'monthly';
    utilitiesIncluded: boolean;
  };
  
  // Step 3: Amenities
  amenities: string[];
  
  // Step 4: Preferences
  preferences: {
    pets: {
      allowed: boolean;
      deposit: number;
    };
    ageRange: {
      min: number;
      max: number;
    };
    occupation: string[];
    languages: string[];
    lifestyle: {
      smoking: boolean;
      parties: boolean;
      quietHours: boolean;
    };
  };
  
  // Step 5: Description & Images
  description: string;
  images: File[];
  
  // Step 6: Additional info
  virtualTourUrl: string;
  contactPreference: string;
}

const initialData: PropertyListing = {
  type: '',
  details: {
    address: '',
    unitNumber: '',
    availability: {
      from: '',
      to: '',
    },
    capacity: 1,
    bedrooms: 1,
    bathrooms: 1,
    size: 0,
    tenure: '',
  },
  pricing: {
    rent: 0,
    deposit: 0,
    schedule: 'monthly',
    utilitiesIncluded: false,
  },
  amenities: [],
  preferences: {
    pets: {
      allowed: false,
      deposit: 0,
    },
    ageRange: {
      min: 18,
      max: 35,
    },
    occupation: [],
    languages: [],
    lifestyle: {
      smoking: false,
      parties: false,
      quietHours: true,
    },
  },
  description: '',
  images: [],
  virtualTourUrl: '',
  contactPreference: 'message',
};

export default function ListingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyListing>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = useCallback((updates: Partial<PropertyListing>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Transform wizard data to match your Post model
      const addressParts = formData.details.address.split(',').map(part => part.trim());
      const city = addressParts.length > 1 ? addressParts[1] : addressParts[0] || 'Unknown City';
      
      const postData = {
        category: 'accommodation',
        title: `${formData.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${formData.details.address}`,
        content: formData.description,
        description: formData.description, // Backend requires this field
        price: {
          amount: formData.pricing.rent,
          type: formData.pricing.schedule,
          currency: 'GBP'
        },
        location: {
          address: formData.details.address,
          city: city,
          state: addressParts.length > 2 ? addressParts[2] : '',
          country: 'US'
        },
        details: {
          accommodation: {
            type: formData.type,
            bedrooms: formData.details.bedrooms,
            bathrooms: formData.details.bathrooms,
            capacity: formData.details.capacity,
            size: formData.details.size,
            amenities: formData.amenities,
            rating: null // Can be added later
          }
        },
        metadata: {
          // Property basics
          propertyType: formData.type,
          
          // Details
          address: formData.details.address,
          unitNumber: formData.details.unitNumber,
          availability: formData.details.availability,
          capacity: formData.details.capacity,
          bedrooms: formData.details.bedrooms,
          bathrooms: formData.details.bathrooms,
          size: formData.details.size,
          tenure: formData.details.tenure,
          
          // Pricing
          pricing: {
            rent: formData.pricing.rent,
            schedule: formData.pricing.schedule,
            deposit: formData.pricing.deposit,
            utilitiesIncluded: formData.pricing.utilitiesIncluded
          },
          
          // Amenities
          amenities: formData.amenities,
          
          // Preferences
          preferences: formData.preferences,
          
          // Additional info
          virtualTourUrl: formData.virtualTourUrl,
          contactPreference: formData.contactPreference,
          images: formData.images
        }
      };

      // Make API call to your backend
      const result = await apiClient.createPost(postData);
      
      // Show success message
      alert('🎉 Property listed successfully! Your listing is now live.');
      
      // Redirect to accommodation page
      window.location.href = '/accommodation?success=true';
      
    } catch (error) {
      console.error('Error submitting listing:', error);
      alert('❌ Failed to submit listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyTypeStep
            data={formData}
            updateData={updateFormData}
          />
        );
      case 2:
        return (
          <PropertyDetailsStep
            data={formData}
            updateData={updateFormData}
          />
        );
      case 3:
        return (
          <AmenitiesStep
            data={formData}
            updateData={updateFormData}
          />
        );
      case 4:
        return (
          <PreferencesStep
            data={formData}
            updateData={updateFormData}
          />
        );
      case 5:
        return (
          <DescriptionStep
            data={formData}
            updateData={updateFormData}
          />
        );
      case 6:
        return (
          <SummaryStep
            data={formData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.type !== '';
      case 2:
        return formData.details.address && formData.pricing.rent > 0;
      case 3:
        return true; // Amenities are optional
      case 4:
        return true; // Preferences are optional
      case 5:
        return formData.description.length > 50;
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Property</h1>
        <p className="text-gray-600">Complete the steps below to list your accommodation</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Step Indicator */}
        <div className="lg:col-span-1">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-8">
              {renderStep()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Listing'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
