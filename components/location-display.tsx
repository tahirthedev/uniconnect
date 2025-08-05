'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  getLocationWithCache,
  getCachedLocationOnly,
  saveLocationToStorage, 
  LocationData 
} from '@/lib/location';

interface LocationDisplayProps {
  onLocationUpdate?: (location: LocationData) => void;
  showMap?: boolean;
  compact?: boolean;
}

export default function LocationDisplay({ 
  onLocationUpdate, 
  showMap = true, 
  compact = false 
}: LocationDisplayProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the callback to prevent infinite re-renders
  const memoizedOnLocationUpdate = useCallback((loc: LocationData) => {
    onLocationUpdate?.(loc);
  }, [onLocationUpdate]);

  useEffect(() => {
    // Try to get location from storage first
    const savedLocation = getCachedLocationOnly();
    if (savedLocation) {
      setLocation(savedLocation);
      memoizedOnLocationUpdate(savedLocation);
    } else {
      // Auto-detect location on first visit (homepage only)
      handleGetLocation();
    }
  }, []); // Remove onLocationUpdate from dependencies to prevent infinite loop

  const handleGetLocation = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const fullLocation = await getLocationWithCache(forceRefresh);
      
      if (fullLocation) {
        setLocation(fullLocation);
        memoizedOnLocationUpdate(fullLocation);
        
        // Notify other components that location was updated
        window.dispatchEvent(new CustomEvent('locationUpdated', { 
          detail: fullLocation 
        }));
      } else {
        setError('Failed to get location');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const getMapUrl = (lat: number, lng: number) => {
    // Using OpenStreetMap tile service (free)
    const zoom = 13;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-orange-500" />
        {loading ? (
          <span className="flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Detecting...
          </span>
        ) : location ? (
          <span>{location.city || 'Unknown City'}</span>
        ) : (
          <button 
            onClick={() => handleGetLocation(true)}
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Enable Location
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Location</h3>
        <button
          onClick={() => handleGetLocation(true)}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>{loading ? 'Updating...' : 'Update'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {location ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {location.city || 'Unknown City'}
              </p>
              {location.area && (
                <p className="text-sm text-gray-600">{location.area}</p>
              )}
              {location.country && (
                <p className="text-xs text-gray-500">{location.country}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Accuracy: ±{Math.round(location.accuracy || 0)}m
              </p>
            </div>
          </div>

          {showMap && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={getMapUrl(location.latitude, location.longitude)}
                width="100%"
                height="200"
                style={{ border: 0 }}
                loading="lazy"
                title="Your location on map"
                className="w-full"
              ></iframe>
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
                📍 You are here
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 We use your location to show nearby services and listings relevant to your area.
          </div>
        </div>
      ) : !loading && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Location not detected</p>
          <button
            onClick={() => handleGetLocation(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
          >
            <MapPin className="h-4 w-4" />
            <span>Enable Location</span>
          </button>
        </div>
      )}
    </div>
  );
}
