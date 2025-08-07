'use client';

import { useState } from 'react';
import { 
  Heart, 
  Users, 
  Briefcase, 
  GraduationCap, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  Cigarette,
  Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface PreferencesStepProps {
  data: any;
  updateData: (updates: any) => void;
}

const occupationOptions = [
  { id: 'student', name: 'Students', icon: GraduationCap },
  { id: 'professional', name: 'Young Professionals', icon: Briefcase },
  { id: 'any', name: 'Any Occupation', icon: Users },
];

const languageOptions = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Arabic', 'Chinese', 'Hindi', 'Japanese', 'Korean', 'Other'
];

export default function PreferencesStep({ data, updateData }: PreferencesStepProps) {
  const [activeSection, setActiveSection] = useState('pets');

  const handlePreferencesUpdate = (field: string, value: any) => {
    updateData({
      preferences: {
        ...data.preferences,
        [field]: value,
      },
    });
  };

  const toggleOccupation = (occupation: string) => {
    const current = data.preferences.occupation || [];
    const updated = current.includes(occupation)
      ? current.filter((o: string) => o !== occupation)
      : [...current, occupation];
    
    handlePreferencesUpdate('occupation', updated);
  };

  const toggleLanguage = (language: string) => {
    const current = data.preferences.languages || [];
    const updated = current.includes(language)
      ? current.filter((l: string) => l !== language)
      : [...current, language];
    
    handlePreferencesUpdate('languages', updated);
  };

  const sections = [
    { id: 'pets', title: 'Pets Policy', icon: Heart },
    { id: 'demographics', title: 'Demographics', icon: Users },
    { id: 'occupation', title: 'Occupation', icon: Briefcase },
    { id: 'language', title: 'Languages', icon: MessageSquare },
    { id: 'lifestyle', title: 'Lifestyle', icon: Home },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tenant Preferences
        </h2>
        <p className="text-gray-600">
          Set your preferences to find the right tenants (all optional)
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.title}
            </button>
          );
        })}
      </div>

      {/* Pets Section */}
      {activeSection === 'pets' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Pets Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Allow Pets</h4>
                <p className="text-sm text-gray-600">Are pets welcome in your property?</p>
              </div>
              <Switch
                checked={data.preferences.pets?.allowed || false}
                onCheckedChange={(checked) =>
                  handlePreferencesUpdate('pets', {
                    ...data.preferences.pets,
                    allowed: checked,
                  })
                }
              />
            </div>

            {data.preferences.pets?.allowed && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Deposit (Optional)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="number"
                    min="0"
                    value={data.preferences.pets?.deposit || 0}
                    onChange={(e) =>
                      handlePreferencesUpdate('pets', {
                        ...data.preferences.pets,
                        deposit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="100"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Demographics Section */}
      {activeSection === 'demographics' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Age Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={data.preferences.ageRange?.min || 18}
                  onChange={(e) =>
                    handlePreferencesUpdate('ageRange', {
                      ...data.preferences.ageRange,
                      min: parseInt(e.target.value) || 18,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={data.preferences.ageRange?.max || 35}
                  onChange={(e) =>
                    handlePreferencesUpdate('ageRange', {
                      ...data.preferences.ageRange,
                      max: parseInt(e.target.value) || 35,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Occupation Section */}
      {activeSection === 'occupation' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Preferred Occupation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {occupationOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = (data.preferences.occupation || []).includes(option.id);
                
                return (
                  <div
                    key={option.id}
                    onClick={() => toggleOccupation(option.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <Icon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? 'text-orange-600' : 'text-gray-600'}`} />
                      <h4 className="font-medium text-gray-900">{option.name}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Section */}
      {activeSection === 'language' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Preferred Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {languageOptions.map((language) => {
                const isSelected = (data.preferences.languages || []).includes(language);
                
                return (
                  <button
                    key={language}
                    onClick={() => toggleLanguage(language)}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language}
                  </button>
                );
              })}
            </div>
            
            {(data.preferences.languages || []).length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected languages:</p>
                <div className="flex flex-wrap gap-1">
                  {(data.preferences.languages || []).map((lang: string) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lifestyle Section */}
      {activeSection === 'lifestyle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Lifestyle Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cigarette className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Smoking Allowed</h4>
                    <p className="text-sm text-gray-600">Is smoking permitted in the property?</p>
                  </div>
                </div>
                <Switch
                  checked={data.preferences.lifestyle?.smoking || false}
                  onCheckedChange={(checked) =>
                    handlePreferencesUpdate('lifestyle', {
                      ...data.preferences.lifestyle,
                      smoking: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Parties/Events Allowed</h4>
                    <p className="text-sm text-gray-600">Can tenants host parties or events?</p>
                  </div>
                </div>
                <Switch
                  checked={data.preferences.lifestyle?.parties || false}
                  onCheckedChange={(checked) =>
                    handlePreferencesUpdate('lifestyle', {
                      ...data.preferences.lifestyle,
                      parties: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <VolumeX className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Quiet Hours Required</h4>
                    <p className="text-sm text-gray-600">Should tenants observe quiet hours?</p>
                  </div>
                </div>
                <Switch
                  checked={data.preferences.lifestyle?.quietHours !== false}
                  onCheckedChange={(checked) =>
                    handlePreferencesUpdate('lifestyle', {
                      ...data.preferences.lifestyle,
                      quietHours: checked,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">✨ Your Preferences</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Pets: {data.preferences.pets?.allowed ? 'Allowed' : 'Not allowed'}</p>
          <p>• Age range: {data.preferences.ageRange?.min || 18} - {data.preferences.ageRange?.max || 35} years</p>
          <p>• Occupation: {(data.preferences.occupation || []).length > 0 ? (data.preferences.occupation || []).join(', ') : 'Any'}</p>
          <p>• Languages: {(data.preferences.languages || []).length > 0 ? `${(data.preferences.languages || []).length} selected` : 'Any'}</p>
        </div>
      </div>
    </div>
  );
}
