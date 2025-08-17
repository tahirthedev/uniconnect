'use client';

import { Home, DoorOpen, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyTypeStepProps {
  data: any;
  updateData: (updates: any) => void;
  validationErrors?: string[];
}

const propertyTypes = [
  {
    id: 'entire-place',
    title: 'Entire Place',
    description: 'A complete apartment, house, or property that guests have to themselves',
    icon: Home,
    features: ['Private entrance', 'Full kitchen', 'Private bathroom', 'Complete privacy'],
  },
  {
    id: 'private-room',
    title: 'Private Room',
    description: 'A private room in a house or apartment with shared common areas',
    icon: DoorOpen,
    features: ['Private bedroom', 'Shared kitchen', 'Shared bathroom', 'Common areas'],
  },
  {
    id: 'shared-room',
    title: 'Shared Room',
    description: 'A shared bedroom or dormitory-style accommodation',
    icon: Users,
    features: ['Shared bedroom', 'Shared facilities', 'Budget-friendly', 'Social environment'],
  },
  {
    id: 'roommate-wanted',
    title: 'Roommate Wanted',
    description: 'Looking for someone to share your existing accommodation',
    icon: Users,
    features: ['Existing tenant', 'Shared expenses', 'Established home', 'Community living'],
  },
];

export default function PropertyTypeStep({ data, updateData, validationErrors = [] }: PropertyTypeStepProps) {
  const handleTypeSelect = (type: string) => {
    updateData({ type });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What type of accommodation are you listing?
        </h2>
        <p className="text-gray-600">
          Choose the option that best describes your property
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = data.type === type.id;
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-orange-500 bg-orange-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleTypeSelect(type.id)}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {type.description}
                  </p>
                  
                  <ul className="text-xs text-gray-500 space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {validationErrors.includes('property-type') && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">
            ⚠️ Please select a property type to continue.
          </p>
        </div>
      )}

      {data.type && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 text-sm">
            ✅ Great choice! You've selected{' '}
            <strong>
              {propertyTypes.find(t => t.id === data.type)?.title}
            </strong>
            . This helps students understand exactly what type of accommodation you're offering.
          </p>
        </div>
      )}
    </div>
  );
}
