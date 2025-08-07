'use client';

import { useState } from 'react';
import { 
  Wifi, 
  Car, 
  Dumbbell, 
  Waves, 
  TreePine, 
  Zap, 
  Flame,
  Snowflake,
  Utensils,
  Shirt,
  Shield,
  Camera,
  ArrowUp,
  ParkingCircle,
  Sofa,
  Bed,
  Monitor,
  Coffee,
  Bath,
  Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AmenitiesStepProps {
  data: any;
  updateData: (updates: any) => void;
}

const amenityCategories = [
  {
    title: 'Essential Utilities',
    amenities: [
      { id: 'wifi', name: 'WiFi Internet', icon: Wifi },
      { id: 'electricity', name: 'Electricity Included', icon: Zap },
      { id: 'heating', name: 'Central Heating', icon: Flame },
      { id: 'hot_water', name: 'Hot Water', icon: Bath },
    ],
  },
  {
    title: 'Kitchen & Dining',
    amenities: [
      { id: 'kitchen_full', name: 'Full Kitchen', icon: Utensils },
      { id: 'microwave', name: 'Microwave', icon: Coffee },
      { id: 'dishwasher', name: 'Dishwasher', icon: Utensils },
      { id: 'dining_area', name: 'Dining Area', icon: Utensils },
    ],
  },
  {
    title: 'Furniture & Furnishing',
    amenities: [
      { id: 'furnished', name: 'Fully Furnished', icon: Sofa },
      { id: 'semi_furnished', name: 'Semi Furnished', icon: Bed },
      { id: 'desk', name: 'Study Desk', icon: Monitor },
      { id: 'wardrobe', name: 'Wardrobe', icon: Shirt },
    ],
  },
  {
    title: 'Building Facilities',
    amenities: [
      { id: 'elevator', name: 'Elevator/Lift', icon: ArrowUp },
      { id: 'parking', name: 'Parking Space', icon: Car },
      { id: 'gym', name: 'Gym/Fitness Center', icon: Dumbbell },
      { id: 'laundry', name: 'Laundry Facilities', icon: Shirt },
    ],
  },
  {
    title: 'Comfort & Climate',
    amenities: [
      { id: 'air_conditioning', name: 'Air Conditioning', icon: Snowflake },
      { id: 'balcony', name: 'Balcony/Terrace', icon: TreePine },
      { id: 'garden', name: 'Garden Access', icon: TreePine },
      { id: 'ventilation', name: 'Good Ventilation', icon: Wind },
    ],
  },
  {
    title: 'Security & Safety',
    amenities: [
      { id: 'security_system', name: 'Security System', icon: Shield },
      { id: 'cctv', name: 'CCTV Monitoring', icon: Camera },
      { id: 'secure_entry', name: 'Secure Entry', icon: Shield },
      { id: 'fire_safety', name: 'Fire Safety Equipment', icon: Shield },
    ],
  },
];

export default function AmenitiesStep({ data, updateData }: AmenitiesStepProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);

  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = data.amenities || [];
    const isSelected = currentAmenities.includes(amenityId);
    
    const updatedAmenities = isSelected
      ? currentAmenities.filter((id: string) => id !== amenityId)
      : [...currentAmenities, amenityId];
    
    updateData({ amenities: updatedAmenities });
  };

  const isSelected = (amenityId: string) => {
    return (data.amenities || []).includes(amenityId);
  };

  const selectedCount = (data.amenities || []).length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What amenities does your property offer?
        </h2>
        <p className="text-gray-600">
          Select all amenities that apply to attract the right tenants
        </p>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="mt-2">
            {selectedCount} amenities selected
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Navigation */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {amenityCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCategory === index
                    ? 'bg-orange-100 text-orange-900 border-2 border-orange-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-sm">{category.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {category.amenities.filter(a => isSelected(a.id)).length} of {category.amenities.length} selected
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{amenityCategories[selectedCategory].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenityCategories[selectedCategory].amenities.map((amenity) => {
                  const Icon = amenity.icon;
                  const selected = isSelected(amenity.id);
                  
                  return (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        selected
                          ? 'border-orange-500 bg-orange-50 text-orange-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selected
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{amenity.name}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Amenities Summary */}
      {selectedCount > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Selected Amenities ({selectedCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(data.amenities || []).map((amenityId: string) => {
                // Find the amenity details
                const amenity = amenityCategories
                  .flatMap(cat => cat.amenities)
                  .find(a => a.id === amenityId);
                
                if (!amenity) return null;
                
                const Icon = amenity.icon;
                
                return (
                  <Badge
                    key={amenityId}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <Icon className="h-3 w-3" />
                    {amenity.name}
                    <button
                      onClick={() => toggleAmenity(amenityId)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Amenity Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• More amenities can help justify higher rent prices</li>
          <li>• WiFi and heating are essential for most students</li>
          <li>• Furnished properties are often preferred by international students</li>
          <li>• Security features are highly valued</li>
        </ul>
      </div>
    </div>
  );
}
