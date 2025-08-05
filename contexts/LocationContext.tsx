'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getCachedLocationOnly, getLocationWithCache, LocationData as LibLocationData } from '@/lib/location';

interface LocationData {
  lat?: number;
  lng?: number;
  radius?: number;
  hasLocation: boolean;
  address?: string;
  loading?: boolean;
  error?: string | null;
}

interface LocationContextType {
  locationData: LocationData;
  updateLocation: (forceRefresh?: boolean) => Promise<void>;
  updateRadius: (newRadius: number) => void;
  isLoading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: React.ReactNode;
  defaultRadius?: number;
}

export function LocationProvider({ children, defaultRadius = 20 }: LocationProviderProps) {
  const [locationData, setLocationData] = useState<LocationData>({
    hasLocation: false,
    loading: true,
    radius: defaultRadius
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if initial load is complete
  const initialLoadRef = useRef(false);
  const lastLocationStringRef = useRef<string>('');

  // Helper function to convert lib LocationData to component LocationData
  const convertLocationData = useCallback((libData: LibLocationData): { lat: number; lng: number; address?: string } => {
    return {
      lat: libData.latitude,
      lng: libData.longitude,
      address: libData.city || libData.area || libData.country
    };
  }, []);

  // Helper function to create consistent location object
  const createLocationObject = useCallback((data: LibLocationData | null): LocationData => {
    if (!data || !data.latitude || !data.longitude) {
      return {
        hasLocation: false,
        loading: false,
        radius: locationData.radius || defaultRadius
      };
    }

    const converted = convertLocationData(data);
    return {
      lat: converted.lat,
      lng: converted.lng,
      radius: locationData.radius || defaultRadius,
      hasLocation: true,
      address: converted.address,
      loading: false
    };
  }, [locationData.radius, defaultRadius, convertLocationData]);

  // Update location data only if it has actually changed
  const updateLocationData = useCallback((newData: LocationData) => {
    const newLocationString = JSON.stringify({
      lat: newData.lat,
      lng: newData.lng,
      hasLocation: newData.hasLocation,
      address: newData.address
    });

    // Only update if location data has actually changed
    if (newLocationString !== lastLocationStringRef.current) {
      console.log('🌍 LocationContext: Location data changed, updating state');
      lastLocationStringRef.current = newLocationString;
      setLocationData(newData);
    } else {
      console.log('🚫 LocationContext: Location data unchanged, skipping update');
    }
  }, []);

  // Initialize location on mount
  useEffect(() => {
    if (initialLoadRef.current) return;
    
    console.log('🌍 LocationContext: Initializing location...');
    initialLoadRef.current = true;
    
    const initializeLocation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get cached location first
        const cachedLocation = getCachedLocationOnly();
        
        if (cachedLocation && cachedLocation.latitude && cachedLocation.longitude) {
          console.log('🌍 LocationContext: Found cached location:', cachedLocation);
          const locationObj = createLocationObject(cachedLocation);
          updateLocationData(locationObj);
        } else {
          console.log('🌍 LocationContext: No cached location found');
          updateLocationData(createLocationObject(null));
        }
      } catch (err) {
        console.error('🌍 LocationContext: Error initializing location:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize location');
        updateLocationData(createLocationObject(null));
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocation();
  }, [createLocationObject, updateLocationData]);

  // Listen for location updates from other parts of the app
  useEffect(() => {
    const handleLocationUpdate = (event: Event) => {
      console.log('🌍 LocationContext: Received locationUpdated event');
      const cachedLocation = getCachedLocationOnly();
      
      if (cachedLocation) {
        const locationObj = createLocationObject(cachedLocation);
        updateLocationData(locationObj);
      }
    };

    window.addEventListener('locationUpdated', handleLocationUpdate);
    return () => window.removeEventListener('locationUpdated', handleLocationUpdate);
  }, [createLocationObject, updateLocationData]);

  // Function to update location (for manual refresh)
  const updateLocation = useCallback(async (forceRefresh = false) => {
    console.log('🌍 LocationContext: updateLocation called, forceRefresh:', forceRefresh);
    
    try {
      setIsLoading(true);
      setError(null);

      const newLocation = await getLocationWithCache(forceRefresh);
      
      if (newLocation && newLocation.latitude && newLocation.longitude) {
        console.log('🌍 LocationContext: Got new location:', newLocation);
        const locationObj = createLocationObject(newLocation);
        updateLocationData(locationObj);
      } else {
        console.log('🌍 LocationContext: No location data received');
        setError('Could not get location');
      }
    } catch (err) {
      console.error('🌍 LocationContext: Error updating location:', err);
      setError(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setIsLoading(false);
    }
  }, [createLocationObject, updateLocationData]);

  // Function to update only the radius
  const updateRadius = useCallback((newRadius: number) => {
    console.log('🌍 LocationContext: updateRadius called:', newRadius);
    
    setLocationData(prev => {
      if (prev.radius === newRadius) {
        console.log('🚫 LocationContext: Radius unchanged, skipping update');
        return prev;
      }
      
      console.log('✅ LocationContext: Radius changed, updating');
      return { ...prev, radius: newRadius };
    });
  }, []);

  const contextValue: LocationContextType = {
    locationData,
    updateLocation,
    updateRadius,
    isLoading,
    error
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

// Hook for components that need to update location
export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

// Hook for components that only need to read location data
export function useLocationData(): LocationData & { isLoading: boolean; error: string | null } {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationData must be used within a LocationProvider');
  }
  return {
    ...context.locationData,
    isLoading: context.isLoading,
    error: context.error
  };
}
