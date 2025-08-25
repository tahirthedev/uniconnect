'use client';

import { 
  Eye, 
  Edit, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Home, 
  Sparkles,
  Heart,
  FileText,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadedImage } from '@/lib/post-utils';

interface SummaryStepProps {
  data: any;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function SummaryStep({ data, onSubmit, isSubmitting }: SummaryStepProps) {
  const formatPrice = (amount: number, schedule: string) => {
    if (!amount) return 'Contact for price';
    return `£${amount}/${schedule === 'monthly' ? 'month' : 'week'}`;
  };

  const getPropertyTypeLabel = (type: string) => {
    const types = {
      'entire_house': 'Entire Place',
      'private_room': 'Private Room',
      'shared_room': 'Shared Room',
    };
    return types[type as keyof typeof types] || type;
  };

  const amenityCategories = [
    {
      title: 'Essential Utilities',
      amenities: [
        { id: 'wifi', name: 'WiFi Internet' },
        { id: 'electricity', name: 'Electricity Included' },
        { id: 'heating', name: 'Central Heating' },
        { id: 'hot_water', name: 'Hot Water' },
      ],
    },
    {
      title: 'Kitchen & Dining',
      amenities: [
        { id: 'kitchen_full', name: 'Full Kitchen' },
        { id: 'microwave', name: 'Microwave' },
        { id: 'dishwasher', name: 'Dishwasher' },
        { id: 'dining_area', name: 'Dining Area' },
      ],
    },
    {
      title: 'Furniture & Furnishing',
      amenities: [
        { id: 'furnished', name: 'Fully Furnished' },
        { id: 'semi_furnished', name: 'Semi Furnished' },
        { id: 'desk', name: 'Study Desk' },
        { id: 'wardrobe', name: 'Wardrobe' },
      ],
    },
  ];

  const getAmenityName = (amenityId: string) => {
    const allAmenities = amenityCategories.flatMap(cat => cat.amenities);
    return allAmenities.find(a => a.id === amenityId)?.name || amenityId;
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Listing
        </h2>
        <p className="text-gray-600">
          Check all details before publishing your property listing
        </p>
      </div>

      {/* Property Preview Card */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Eye className="h-5 w-5" />
            Listing Preview
          </CardTitle>
          <p className="text-sm text-orange-700">This is how your listing will appear to students</p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Main Property Card */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {/* Image Section */}
            <div className="relative">
              {data.images && data.images.length > 0 ? (
                <img
                  src={(data.images[0] as UploadedImage).url}
                  alt="Property"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <Home className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-orange-600">{getPropertyTypeLabel(data.type)}</Badge>
              </div>
              {data.images && data.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  +{data.images.length - 1} photos
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {getPropertyTypeLabel(data.type)} Available
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPrice(data.pricing?.rent, data.pricing?.schedule)}
                  </div>
                  {data.pricing?.utilitiesIncluded && (
                    <div className="text-sm text-green-600">Utilities included</div>
                  )}
                </div>
              </div>

              {/* Location */}
              {data.details?.address && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{data.details.address}</span>
                </div>
              )}

              {/* Property Details */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                {data.details?.capacity && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{data.details.capacity} {data.details.capacity === 1 ? 'person' : 'people'}</span>
                  </div>
                )}
                {data.details?.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span>{data.details.bedrooms} {data.details.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
                  </div>
                )}
                {data.details?.bathrooms && (
                  <div className="flex items-center gap-1">
                    <span>{data.details.bathrooms} {data.details.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {data.description && (
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {data.description}
                </p>
              )}

              {/* Amenities */}
              {data.amenities && data.amenities.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {data.amenities.slice(0, 3).map((amenityId: string) => (
                      <Badge key={amenityId} variant="secondary" className="text-xs">
                        {getAmenityName(amenityId)}
                      </Badge>
                    ))}
                    {data.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{data.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Availability */}
              {data.details?.availability?.from && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Available from {new Date(data.details.availability.from).toLocaleDateString()}</span>
                </div>
              )}

              {/* Action Button */}
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Contact About This Property
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Property Type:</span>
              <span className="font-medium">{getPropertyTypeLabel(data.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Capacity:</span>
              <span className="font-medium">{data.details?.capacity || 'Not specified'} people</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bedrooms:</span>
              <span className="font-medium">{data.details?.bedrooms || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bathrooms:</span>
              <span className="font-medium">{data.details?.bathrooms || 0}</span>
            </div>
            {data.details?.size > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{data.details.size} sq ft</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Rent:</span>
              <span className="font-medium">{formatPrice(data.pricing?.rent, data.pricing?.schedule)}</span>
            </div>
            {data.pricing?.deposit > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit:</span>
                <span className="font-medium">£{data.pricing.deposit}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Utilities:</span>
              <span className="font-medium">{data.pricing?.utilitiesIncluded ? 'Included' : 'Not included'}</span>
            </div>
            {data.details?.tenure && (
              <div className="flex justify-between">
                <span className="text-gray-600">Min. Tenure:</span>
                <span className="font-medium">{data.details.tenure}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Content Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className={`font-medium ${data.description?.length >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                  {data.description?.length >= 50 ? '✅ Complete' : '❌ Too short'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Photos:</span>
                <span className={`font-medium ${(data.images || []).length > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {(data.images || []).length > 0 ? `✅ ${(data.images || []).length} uploaded` : '⚠️ No photos'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amenities:</span>
                <span className="font-medium text-green-600">
                  {(data.amenities || []).length} selected
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tenant Preferences:</span>
                <span className="font-medium text-green-600">✅ Set</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Virtual Tour:</span>
                <span className={`font-medium ${data.virtualTourUrl ? 'text-green-600' : 'text-gray-500'}`}>
                  {data.virtualTourUrl ? '✅ Added' : '➖ Optional'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Actions */}
      <Card className="border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Check className="h-6 w-6" />
              <span className="text-lg font-medium">Ready to Publish!</span>
            </div>
            <p className="text-gray-600">
              Your listing is complete and ready to be published. Students will be able to see and contact you about this property.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Publish Listing
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
