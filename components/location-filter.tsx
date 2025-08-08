'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Filter, X } from 'lucide-react';
import { getCachedLocationOnly } from '@/lib/location';

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
  const [locationStatus, setLocationStatus] = useState<'available' | 'unavailable'>('unavailable');

  // Ref to prevent duplicate filter calls
  const lastFilterRef = useRef<string>('');

  // Memoize the callback to prevent infinite re-renders
  const memoizedOnFilterChange = useCallback(onFilterChange, [onFilterChange]);

  useEffect(() => {
    // Only check for cached location - no auto-detection
    checkCachedLocation();
    
    // Listen for location updates from homepage
    const handleLocationUpdate = () => {
      checkCachedLocation();
    };
    
    window.addEventListener('locationUpdated', handleLocationUpdate);
    
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
    };
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    // Notify parent of filter changes only if they actually changed
    const filterData = {
      lat: locationEnabled && userLocation ? userLocation.lat : undefined,
      lng: locationEnabled && userLocation ? userLocation.lng : undefined,
      radius: locationEnabled ? radius : undefined,
      hasLocation: locationEnabled && !!userLocation
    };
    
    const filterString = JSON.stringify(filterData);
    
    // Only call if the filter data has actually changed
    if (filterString !== lastFilterRef.current) {
      lastFilterRef.current = filterString;
      memoizedOnFilterChange(filterData);
    }
  }, [userLocation, radius, locationEnabled, memoizedOnFilterChange]);

  const checkCachedLocation = useCallback(() => {
    try {
      const cachedLocation = getCachedLocationOnly();
      if (cachedLocation) {
        const newUserLocation = { lat: cachedLocation.latitude, lng: cachedLocation.longitude };
        
        // Set location data immediately - don't rely on comparison
        setUserLocation(newUserLocation);
        setLocationStatus('available');
        setLocationEnabled(true);
      } else {
        setLocationStatus('unavailable');
        setLocationEnabled(false);
        setUserLocation(null);
      }
    } catch (error) {
      console.error('Failed to get cached location:', error);
      setLocationStatus('unavailable');
      setLocationEnabled(false);
      setUserLocation(null);
    }
  }, []);

  const toggleLocation = () => {
    if (userLocation) {
      setLocationEnabled(!locationEnabled);
    }
    // If no location is cached, user needs to update location on homepage
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 relative">
        <button
          onClick={toggleLocation}
          disabled={!userLocation}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !userLocation
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : locationEnabled 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <MapPin className="h-3 w-3" />
          {!userLocation ? 'Set location' : 
           locationEnabled ? `${radius}km` : 'Near me'}
        </button>
        
        {locationEnabled && userLocation && (
          <select 
            value={radius} 
            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
            className="h-7 w-20 text-xs border border-gray-300 rounded-md bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          >
            {showRadiusOptions.map(option => (
              <option key={option} value={option}>
                {option}km
              </option>
            ))}
          </select>
        )}
        
        {!userLocation && (
          <span className="text-xs text-gray-500">
            Update location on homepage
          </span>
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
          disabled={!userLocation}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            !userLocation
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : locationEnabled 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <MapPin className="h-4 w-4" />
          {!userLocation ? 'Set Location First' : 
           locationEnabled ? 'Location Enabled' : 'Enable Location'}
        </button>
      </div>

      {!userLocation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Please update your location on the homepage to use location-based filtering.</span>
          </div>
        </div>
      )}

      {locationEnabled && userLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Showing results within {radius}km
              </span>
            </div>
            <button
              onClick={() => setLocationEnabled(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-green-700 font-medium">Search Radius</label>
            <select 
              value={radius} 
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="w-full bg-white border border-green-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {showRadiusOptions.map(option => (
                <option key={option} value={option}>
                  {option}km radius
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!userLocation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Please update your location on the homepage to use location-based filtering.</span>
          </div>
        </div>
      )}
    </div>
  );
}
