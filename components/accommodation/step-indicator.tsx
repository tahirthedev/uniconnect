'use client';

import { Check } from 'lucide-react';
import { 
  Home, 
  MapPin, 
  Sparkles, 
  Users, 
  FileText, 
  Eye 
} from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  {
    id: 1,
    title: 'Property Type',
    description: 'What type of accommodation?',
    icon: Home,
  },
  {
    id: 2,
    title: 'Details & Pricing',
    description: 'Location, pricing, and specs',
    icon: MapPin,
  },
  {
    id: 3,
    title: 'Amenities',
    description: 'What facilities are included?',
    icon: Sparkles,
  },
  {
    id: 4,
    title: 'Preferences',
    description: 'Tenant requirements',
    icon: Users,
  },
  {
    id: 5,
    title: 'Description',
    description: 'Photos and description',
    icon: FileText,
  },
  {
    id: 6,
    title: 'Review',
    description: 'Preview and publish',
    icon: Eye,
  },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-gray-900 mb-6">Steps to Complete</h3>
      
      {steps.map((step) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const Icon = step.icon;
        
        return (
          <div
            key={step.id}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
              isCurrent
                ? 'bg-orange-50 border-2 border-orange-200'
                : isCompleted
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-gray-50 border-2 border-transparent'
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-green-600 text-white'
                  : isCurrent
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  isCurrent
                    ? 'text-orange-900'
                    : isCompleted
                    ? 'text-green-900'
                    : 'text-gray-900'
                }`}
              >
                {step.title}
              </p>
              <p
                className={`text-xs ${
                  isCurrent
                    ? 'text-orange-700'
                    : isCompleted
                    ? 'text-green-700'
                    : 'text-gray-500'
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
      
      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Success</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add high-quality photos</li>
          <li>• Write detailed descriptions</li>
          <li>• Set competitive pricing</li>
          <li>• Respond quickly to inquiries</li>
        </ul>
      </div>
    </div>
  );
}
