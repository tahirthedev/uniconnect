'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Loader, AlertCircle } from 'lucide-react';
import { getCurrentLocation, reverseGeocode } from '@/lib/location';

interface LocationSelectorProps {
  onLocationSelect: (location: any) => void;
  defaultLocation?: any;
  showMap?: boolean;
  compact?: boolean;
  required?: boolean;
}

export default function LocationSelector({ 
  onLocationSelect, 
  defaultLocation, 
  showMap = false,
  compact = false,
  required = false
}: LocationSelectorProps) {
  const [location, setLocation] = useState(defaultLocation || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualCity, setManualCity] = useState('');

  // Memoize the callback to prevent infinite re-renders
  const memoizedOnLocationSelect = useCallback(onLocationSelect, []);

  useEffect(() => {
    if (defaultLocation) {
      setLocation(defaultLocation);
    }
  }, [defaultLocation]);

  const handleDetectLocation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const coords = await getCurrentLocation();
      const locationData = await reverseGeocode(coords.latitude, coords.longitude);
      
      const fullLocation = {
        city: (locationData as any).city || (locationData as any).town || (locationData as any).village || 'Unknown City',
        state: (locationData as any).state || (locationData as any).region || '',
        country: (locationData as any).country || 'Unknown Country',
        coordinates: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      };
      
      setLocation(fullLocation);
      memoizedOnLocationSelect(fullLocation);
      setManualCity('');
    } catch (err) {
      setError('Failed to detect location. Please enter manually.');
      console.error('Location detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocation = useCallback((cityName: string) => {
    setManualCity(cityName);
    if (cityName.trim()) {
      const manualLocation = {
        city: cityName.trim(),
        state: '',
        country: 'UK',
        coordinates: null // No coordinates for manual entry
      };
      setLocation(manualLocation);
      memoizedOnLocationSelect(manualLocation);
    }
  }, [memoizedOnLocationSelect]);

  return (
    <div className={`${compact ? 'space-y-2' : 'space-y-4'}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Location {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader className="h-3 w-3 animate-spin" />
          ) : (
            <MapPin className="h-3 w-3" />
          )}
          {loading ? 'Detecting...' : 'Auto-detect'}
        </button>
      </div>

      {/* Manual City Input */}
      <div>
        <input
          type="text"
          placeholder="Enter city name (e.g., London, Manchester)"
          value={manualCity}
          onChange={(e) => handleManualLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />
      </div>

      {/* Location Display */}
      {location && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {location.city}{location.state && `, ${location.state}`}, {location.country}
            </span>
            {location.coordinates && (
              <span className="text-xs text-gray-500">
                (GPS: {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)})
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Optional Map Display */}
      {showMap && location?.coordinates && (
        <div className="rounded-lg overflow-hidden border" style={{ height: '200px' }}>
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.coordinates.longitude-0.01},${location.coordinates.latitude-0.01},${location.coordinates.longitude+0.01},${location.coordinates.latitude+0.01}&layer=mapnik&marker=${location.coordinates.latitude},${location.coordinates.longitude}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            title="Location Map"
          />
        </div>
      )}
    </div>
  );
}
