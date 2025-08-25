'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StepIndicator from '@/components/accommodation/step-indicator';
import PropertyTypeStep from '@/components/accommodation/steps/property-type-step';
import PropertyDetailsStep from '@/components/accommodation/steps/property-details-step';
import AmenitiesStep from '@/components/accommodation/steps/amenities-step';
import PreferencesStep from '@/components/accommodation/steps/preferences-step';
import DescriptionStep from '@/components/accommodation/steps/description-step';
import SummaryStep from '@/components/accommodation/steps/summary-step';
import { apiClient } from '@/lib/api';
import { UploadedImage } from '@/lib/post-utils';

interface PropertyListing {
  // Step 1: Property Type
  type: 'entire-place' | 'private-room' | 'shared-room' | 'roommate-wanted' | '';
  
  // Step 2: Property Details
  details: {
    address: string;
    city: string; // Add separate city field
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
  images: UploadedImage[];
  
  // Step 6: Additional info
  virtualTourUrl: string;
  contactPreference: string;
}

const initialData: PropertyListing = {
  type: '',
  details: {
    address: '',
    city: '', // Add city field to initial data
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
  const { toast } = useToast();

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = useCallback((updates: Partial<PropertyListing>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateStep = (step: number): { isValid: boolean; errors: string[]; nextIncompleteSection?: string } => {
    const errors: string[] = [];
    let nextIncompleteSection: string | undefined;
    
    switch (step) {
      case 1:
        if (!formData.type) errors.push('property-type');
        break;
      case 2:
        // Check each section individually for step 2
        const locationComplete = !!(formData.details.address && formData.details.city);
        const availabilityComplete = !!(formData.details.availability.from && formData.details.tenure);
        const capacityComplete = !!(formData.details.capacity > 0 && formData.details.bedrooms > 0 && formData.details.bathrooms > 0);
        const pricingComplete = !!(formData.pricing.rent > 0 && formData.pricing.deposit >= 0);
        
        // Determine next incomplete section
        if (!locationComplete) {
          nextIncompleteSection = 'location';
          if (!formData.details.address) errors.push('address');
          if (!formData.details.city) errors.push('city');
        } else if (!availabilityComplete) {
          nextIncompleteSection = 'availability';
        } else if (!capacityComplete) {
          nextIncompleteSection = 'capacity';
        } else if (!pricingComplete) {
          nextIncompleteSection = 'pricing';
          if (!formData.pricing.rent || formData.pricing.rent <= 0) errors.push('rent');
          if (formData.pricing.deposit < 0) errors.push('deposit');
        }
        
        // Only proceed to next step if ALL sections are complete
        const allSectionsComplete = locationComplete && availabilityComplete && capacityComplete && pricingComplete;
        if (!allSectionsComplete) {
          errors.push('incomplete-sections');
        }
        break;
      case 3:
        // Amenities are optional
        break;
      case 4:
        // Preferences are optional
        break;
      case 5:
        if (!formData.description || formData.description.length < 50) errors.push('description');
        break;
      case 6:
        // Final validation
        break;
    }
    
    return { isValid: errors.length === 0, errors, nextIncompleteSection };
  };

  const nextStep = () => {
    const validation = validateStep(currentStep);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      
      // Special handling for step 2 - provide helpful navigation message
      if (currentStep === 2 && validation.nextIncompleteSection) {
        const sectionNames = {
          location: 'Location',
          availability: 'Availability', 
          capacity: 'Capacity & Size',
          pricing: 'Pricing'
        };
        const nextSectionName = sectionNames[validation.nextIncompleteSection as keyof typeof sectionNames];
        
        toast({
          title: `Complete ${nextSectionName} section`,
          description: `Please fill in the required fields in the ${nextSectionName} section to continue.`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Please complete required fields",
        description: "The highlighted fields need to be filled before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    setValidationErrors([]);
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
      
      const postData = {
        category: 'accommodation',
        title: `${formData.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${formData.details.city || 'Unknown City'}`,
        content: formData.description,
        description: formData.description, // Backend requires this field
        images: formData.images, // Use uploaded R2 images
        price: {
          amount: formData.pricing.rent,
          type: formData.pricing.schedule,
          currency: 'GBP'
        },
        location: {
          address: formData.details.address,
          city: formData.details.city || (addressParts.length > 1 ? addressParts[1] : ''),
          state: addressParts.length > 2 ? addressParts[2] : '',
          country: 'UK' // Changed to UK since this is for UK students
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
          contactPreference: formData.contactPreference
        }
      };

      // Make API call to your backend
      const result = await apiClient.createPost(postData);
      
      // Show success message
      toast({
        title: "Property listed successfully! 🎉",
        description: "Your accommodation listing is now live and visible to students.",
      });
      
      // Redirect to accommodation page
      window.location.href = '/accommodation?success=true';
      
    } catch (error) {
      console.error('Error submitting listing:', error);
      toast({
        title: "Failed to submit listing",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
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
            validationErrors={validationErrors}
          />
        );
      case 2:
        return (
          <PropertyDetailsStep
            data={formData}
            updateData={updateFormData}
            validationErrors={validationErrors}
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
            validationErrors={validationErrors}
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
    // Always allow proceeding - validation happens when Next is clicked
    return true;
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
