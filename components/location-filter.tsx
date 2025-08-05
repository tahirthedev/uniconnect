'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Filter, X } from 'lucide-react';
import { getCurrentLocation } from '@/lib/location';

interface LocationFilterProps {
  onFilterChange: (filters: {
    lat?: number;
    lng?: number;
    radius?: number;
    hasLocation: boolean;
  }) => void;
  defaultRadius?: number;
  showRadiusOptions?: number[];
  compact?: boolean;
}

export default function LocationFilter({ 
  onFilterChange, 
  defaultRadius = 20,
  showRadiusOptions = [5, 10, 20, 50, 100],
  compact = false
}: LocationFilterProps) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [radius, setRadius] = useState(defaultRadius);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'enabled' | 'disabled' | 'error'>('disabled');

  // Memoize the callback to prevent infinite re-renders
  const memoizedOnFilterChange = useCallback(onFilterChange, []);

  useEffect(() => {
    // Try to get location on mount
    detectLocation();
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    // Notify parent of filter changes
    memoizedOnFilterChange({
      lat: locationEnabled && userLocation ? userLocation.lat : undefined,
      lng: locationEnabled && userLocation ? userLocation.lng : undefined,
      radius: locationEnabled ? radius : undefined,
      hasLocation: locationEnabled && !!userLocation
    });
  }, [userLocation, radius, locationEnabled, memoizedOnFilterChange]);

  const detectLocation = async () => {
    setLocationStatus('detecting');
    try {
      const location = await getCurrentLocation();
      setUserLocation({ lat: location.latitude, lng: location.longitude });
      setLocationEnabled(true);
      setLocationStatus('enabled');
    } catch (error) {
      console.error('Location detection failed:', error);
      setLocationStatus('error');
      setLocationEnabled(false);
    }
  };

  const toggleLocation = () => {
    if (!userLocation) {
      detectLocation();
    } else {
      setLocationEnabled(!locationEnabled);
      setLocationStatus(locationEnabled ? 'disabled' : 'enabled');
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLocation}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            locationEnabled 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <MapPin className="h-3 w-3" />
          {locationStatus === 'detecting' ? 'Detecting...' : 
           locationEnabled ? `${radius}km` : 'Near me'}
        </button>
        
        {locationEnabled && (
          <select 
            value={radius}
            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
            className="text-xs border border-gray-200 rounded px-2 py-1"
          >
            {showRadiusOptions.map(option => (
              <option key={option} value={option}>{option}km</option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Location Filter</label>
        <button
          onClick={toggleLocation}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            locationEnabled 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <MapPin className="h-4 w-4" />
          {locationStatus === 'detecting' ? 'Detecting Location...' : 
           locationStatus === 'error' ? 'Try Again' :
           locationEnabled ? 'Location Enabled' : 'Enable Location'}
        </button>
      </div>

      {locationEnabled && userLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">
              📍 Showing results within {radius}km
            </span>
            <button
              onClick={() => setLocationEnabled(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-green-700">Search Radius</label>
            <div className="flex gap-2">
              {showRadiusOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleRadiusChange(option)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    radius === option
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                  }`}
                >
                  {option}km
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {locationStatus === 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            📍 Location access denied. You can still browse all listings or try enabling location again.
          </p>
        </div>
      )}
    </div>
  );
}
