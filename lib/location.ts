// Location utilities for geolocation and mapping
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  area?: string;
  country?: string;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

// Get user's current location using browser geolocation
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let message = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timeout';
            break;
        }
        reject({ code: error.code, message });
      },
      options
    );
  });
};

// Reverse geocode coordinates to get address info using Nominatim (free)
export const reverseGeocode = async (lat: number, lng: number): Promise<Partial<LocationData>> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'UniConnect-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      return {};
    }

    const address = data.address;
    
    // Enhanced city name extraction with comprehensive fallback hierarchy
    let city = '';
    
    // Priority order for city name extraction - same as backend
    const cityFields = [
      'city',
      'town', 
      'village',
      'municipality',
      'borough',
      'district',
      'neighbourhood',
      'suburb',
      'hamlet',
      'county',
      'state_district',
      'state'
    ];

    // Find the first available city field
    for (const field of cityFields) {
      if (address[field] && address[field].trim()) {
        city = address[field].trim();
        break;
      }
    }

    // If still no city found, try extracting from display_name
    if (!city && data.display_name) {
      const parts = data.display_name.split(',').map((part: string) => part.trim());
      // Take the first non-numeric part as potential city
      for (const part of parts) {
        if (part && !/^\d+$/.test(part) && part.length > 1) {
          city = part;
          break;
        }
      }
    }
    
    return {
      city: city || '',
      area: address?.suburb || address?.neighbourhood || '',
      country: address?.country || ''
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {};
  }
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Local storage helpers
export const saveLocationToStorage = (location: LocationData): void => {
  localStorage.setItem('userLocation', JSON.stringify(location));
  localStorage.setItem('locationTimestamp', Date.now().toString());
};

export const getLocationFromStorage = (): LocationData | null => {
  try {
    const location = localStorage.getItem('userLocation');
    const timestamp = localStorage.getItem('locationTimestamp');
    
    if (!location || !timestamp) {
      return null;
    }
    
    // Check if location is older than 1 hour
    const hourInMs = 60 * 60 * 1000;
    const age = Date.now() - parseInt(timestamp);
    
    if (age > hourInMs) {
      return null;
    }
    
    const parsedLocation = JSON.parse(location);
    return parsedLocation;
  } catch (error) {
    return null;
  }
};

export const clearLocationFromStorage = (): void => {
  localStorage.removeItem('userLocation');
  localStorage.removeItem('locationTimestamp');
};

// Get cached location only - does not fetch new location
export const getCachedLocationOnly = (): LocationData | null => {
  const result = getLocationFromStorage();
  return result;
};

// Get location with automatic fallback to cache or fresh fetch
export const getLocationWithCache = async (forceRefresh: boolean = false): Promise<LocationData | null> => {
  // If not forcing refresh, try cache first
  if (!forceRefresh) {
    const cached = getLocationFromStorage();
    if (cached) {
      return cached;
    }
  }

  // Only fetch fresh location if cache is empty or force refresh is requested
  try {
    const coords = await getCurrentLocation();
    const addressInfo = await reverseGeocode(coords.latitude, coords.longitude);
    
    const fullLocation: LocationData = {
      ...coords,
      ...addressInfo
    };

    saveLocationToStorage(fullLocation);
    return fullLocation;
  } catch (error) {
    console.error('Failed to get fresh location:', error);
    // If fresh fetch fails, return cached location as fallback
    return getLocationFromStorage();
  }
};
