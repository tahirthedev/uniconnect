const { findCity, getNearbyCities, calculateDistance } = require('./ukCities');

/**
 * Smart location matching for accommodation posts
 * Handles various location input formats and provides intelligent fallbacks
 */

// Helper function to normalize city names
const normalizeCity = (city) => {
  if (!city || typeof city !== 'string') return '';
  return city.trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Reverse geocode coordinates to get location information
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Location information with city, country, etc.
 */
async function reverseGeocode(lat, lng) {
  try {
    console.log(`🔍 Reverse geocoding coordinates: ${lat}, ${lng}`);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'UniConnect/1.0 (contact@saydone.net)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OpenStreetMap API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🗺️  OpenStreetMap response:', JSON.stringify(data, null, 2));

    if (!data || !data.address) {
      console.log('❌ No address data found in response');
      return {
        city: 'Unknown City',
        country: 'Unknown Country',
        fullAddress: 'Location not found',
        raw: data
      };
    }

    const address = data.address;
    
    // Enhanced city name extraction with comprehensive fallback hierarchy
    let city = null;
    
    // Priority order for city name extraction
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
        console.log(`✅ Found city using field '${field}': ${city}`);
        break;
      }
    }

    // If still no city found, try extracting from display_name
    if (!city && data.display_name) {
      const parts = data.display_name.split(',').map(part => part.trim());
      // Take the first non-numeric part as potential city
      for (const part of parts) {
        if (part && !/^\d+$/.test(part) && part.length > 1) {
          city = part;
          console.log(`✅ Extracted city from display_name: ${city}`);
          break;
        }
      }
    }

    // Final fallback
    if (!city) {
      city = 'Unknown City';
      console.log('❌ No city found, using fallback');
    }

    const result = {
      city: normalizeCity(city),
      country: address.country || 'Unknown Country',
      countryCode: address.country_code || null,
      state: address.state || address.county || null,
      postcode: address.postcode || null,
      fullAddress: data.display_name || 'Address not available',
      raw: data
    };

    console.log('🎯 Final location result:', result);
    return result;

  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    return {
      city: 'Unknown City',
      country: 'Unknown Country',
      fullAddress: 'Error retrieving location',
      error: error.message
    };
  }
}

/**
 * Build smart location query for accommodation posts
 * @param {Object} params - Search parameters
 * @param {string} params.category - Post category
 * @param {number} params.lat - User latitude
 * @param {number} params.lng - User longitude
 * @param {number} params.radius - Search radius in km
 * @param {string} params.city - City name from user input
 * @returns {Object} - MongoDB query object and metadata
 */
function buildLocationQuery(params) {
  const { category, lat, lng, radius = 20, city } = params;
  
  // For non-accommodation categories, use standard logic (now includes ridesharing improvements)
  if (category !== 'accommodation') {
    return buildStandardLocationQuery({ lat, lng, radius, city, category });
  }
  
  // Accommodation-specific smart location matching
  return buildAccommodationLocationQuery(params);
}

/**
 * Build location query for accommodation posts with intelligent fallbacks
 */
function buildAccommodationLocationQuery({ lat, lng, radius = 20, city }) {
  const queries = [];
  const metadata = {
    searchType: 'accommodation',
    fallbacksUsed: [],
    searchArea: null
  };
  
  // Strategy 1: GPS + City hybrid search
  if (lat && lng) {
    const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const nearbyCities = getNearbyCities(userLocation.lat, userLocation.lng, radius);
    
    if (nearbyCities.length > 0) {
      // Find posts within radius OR in nearby cities
      const cityNames = nearbyCities.map(city => city.name);
      
      queries.push({
        $or: [
          // GPS-based matching (if posts have coordinates)
          {
            'location.coordinates': {
              $geoWithin: {
                $centerSphere: [[userLocation.lng, userLocation.lat], radius / 6378.1]
              }
            }
          },
          // City-based matching
          {
            $or: [
              { 'location.city': { $in: cityNames.map(name => new RegExp(name, 'i')) } },
              { 'location.address': { $in: cityNames.map(name => new RegExp(name, 'i')) } }
            ]
          }
        ]
      });
      
      metadata.searchArea = {
        center: userLocation,
        radius,
        nearbyCities: nearbyCities.slice(0, 5) // Top 5 nearest cities
      };
      metadata.fallbacksUsed.push('gps_and_cities');
    } else {
      // No nearby cities found, expand search
      queries.push(buildExpandedGPSQuery(userLocation, radius * 2));
      metadata.fallbacksUsed.push('expanded_gps');
    }
  }
  
  // Strategy 2: City name search
  if (city) {
    const foundCity = findCity(city);
    
    if (foundCity) {
      // Find posts in this city and nearby areas
      const nearbyCities = getNearbyCities(foundCity.lat, foundCity.lng, 30);
      const cityNames = [foundCity.name, ...nearbyCities.map(c => c.name)];
      
      queries.push({
        $or: [
          { 'location.city': { $in: cityNames.map(name => new RegExp(name, 'i')) } },
          { 'location.address': { $in: cityNames.map(name => new RegExp(name, 'i')) } },
          { 'location.state': new RegExp(foundCity.region, 'i') }
        ]
      });
      
      metadata.searchArea = {
        requestedCity: city,
        foundCity: foundCity.name,
        region: foundCity.region,
        expandedToNearby: nearbyCities.length > 0
      };
      metadata.fallbacksUsed.push('city_based');
    } else {
      // City not found, try partial matching
      queries.push({
        $or: [
          { 'location.city': new RegExp(city, 'i') },
          { 'location.address': new RegExp(city, 'i') },
          { 'location.state': new RegExp(city, 'i') }
        ]
      });
      metadata.fallbacksUsed.push('partial_city_match');
    }
  }
  
  // Strategy 3: No location provided - show all UK accommodation
  if (queries.length === 0) {
    queries.push({}); // No location filter
    metadata.fallbacksUsed.push('show_all');
  }
  
  // Combine all strategies with OR
  const finalQuery = queries.length === 1 ? queries[0] : { $or: queries };
  
  return { query: finalQuery, metadata };
}

/**
 * Build standard location query for non-accommodation categories
 */
function buildStandardLocationQuery({ lat, lng, radius = 20, city, category }) {
  const metadata = {
    searchType: 'standard',
    fallbacksUsed: []
  };
  
  // For ridesharing, use more flexible location matching
  if (category === 'pick-drop' || category === 'ridesharing') {
    return buildRidesharingLocationQuery({ lat, lng, radius, city });
  }
  
  // GPS-based search for other categories
  if (lat && lng) {
    const query = {
      'location.geoLocation': {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1]
        }
      }
    };
    
    metadata.searchArea = {
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius
    };
    
    return { query, metadata };
  }
  
  // City-based search
  if (city) {
    const query = { 'location.city': new RegExp(city, 'i') };
    metadata.fallbacksUsed.push('city_only');
    return { query, metadata };
  }
  
  // No location filter
  metadata.fallbacksUsed.push('no_location');
  return { query: {}, metadata };
}

/**
 * Build ridesharing-specific location query with flexible matching
 */
function buildRidesharingLocationQuery({ lat, lng, radius = 20, city }) {
  const metadata = {
    searchType: 'ridesharing',
    fallbacksUsed: []
  };
  
  const queries = [];
  
  // Strategy 1: GPS-based with large radius (people travel far for rides)
  if (lat && lng) {
    const expandedRadius = Math.max(radius, 100); // At least 100km for ridesharing
    
    queries.push({
      'location.geoLocation': {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], expandedRadius / 6378.1]
        }
      }
    });
    
    metadata.searchArea = {
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius: expandedRadius
    };
    metadata.fallbacksUsed.push('gps_with_large_radius');
  }
  
  // Strategy 2: City-based search (from/to locations)
  if (city) {
    queries.push({
      $or: [
        { 'location.city': new RegExp(city, 'i') },
        { 'details.ride.from': new RegExp(city, 'i') },
        { 'details.ride.to': new RegExp(city, 'i') }
      ]
    });
    metadata.fallbacksUsed.push('city_and_route_match');
  }
  
  // Strategy 3: If no location provided, show all rides
  if (queries.length === 0) {
    queries.push({});
    metadata.fallbacksUsed.push('show_all_rides');
  }
  
  // Combine strategies with OR
  const finalQuery = queries.length === 1 ? queries[0] : { $or: queries };
  
  return { query: finalQuery, metadata };
}

/**
 * Build expanded GPS query for wider search
 */
function buildExpandedGPSQuery(userLocation, expandedRadius) {
  return {
    'location.coordinates': {
      $geoWithin: {
        $centerSphere: [[userLocation.lng, userLocation.lat], expandedRadius / 6378.1]
      }
    }
  };
}

/**
 * Post-process posts to add distance and location metadata
 * @param {Array} posts - Array of posts
 * @param {Object} userLocation - User's location {lat, lng}
 * @returns {Array} - Posts with added metadata
 */
function addLocationMetadata(posts, userLocation = null) {
  return posts.map(post => {
    const enhanced = { ...post };
    
    // Add distance if user location is provided
    if (userLocation && post.location) {
      if (post.location.coordinates && post.location.coordinates.length === 2) {
        // Post has coordinates, calculate exact distance
        const [lng, lat] = post.location.coordinates;
        enhanced.distance = {
          km: Math.round(calculateDistance(userLocation.lat, userLocation.lng, lat, lng) * 10) / 10,
          calculated: true
        };
      } else if (post.location.city) {
        // Post only has city, estimate distance to city center
        const city = findCity(post.location.city);
        if (city) {
          enhanced.distance = {
            km: Math.round(calculateDistance(userLocation.lat, userLocation.lng, city.lat, city.lng) * 10) / 10,
            calculated: false,
            note: `Estimated distance to ${city.name} city center`
          };
        }
      }
    }
    
    // Add location quality score
    enhanced.locationQuality = calculateLocationQuality(post.location);
    
    return enhanced;
  });
}

/**
 * Calculate location quality score for sorting
 * @param {Object} location - Post location object
 * @returns {number} - Quality score (0-100)
 */
function calculateLocationQuality(location) {
  let score = 0;
  
  if (location.coordinates && location.coordinates.length === 2) score += 40;
  if (location.address && location.address.length > 10) score += 30;
  if (location.city) score += 20;
  if (location.state) score += 10;
  
  return score;
}

/**
 * Sort posts by location relevance
 * @param {Array} posts - Array of posts with location metadata
 * @param {Object} userLocation - User's location
 * @returns {Array} - Sorted posts
 */
function sortByLocationRelevance(posts, userLocation = null) {
  return posts.sort((a, b) => {
    // Primary sort: by distance (if available)
    if (a.distance && b.distance) {
      if (a.distance.calculated && !b.distance.calculated) return -1;
      if (!a.distance.calculated && b.distance.calculated) return 1;
      return a.distance.km - b.distance.km;
    }
    
    if (a.distance && !b.distance) return -1;
    if (!a.distance && b.distance) return 1;
    
    // Secondary sort: by location quality
    const qualityDiff = b.locationQuality - a.locationQuality;
    if (qualityDiff !== 0) return qualityDiff;
    
    // Tertiary sort: by creation date
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

module.exports = {
  buildLocationQuery,
  buildAccommodationLocationQuery,
  buildStandardLocationQuery,
  addLocationMetadata,
  sortByLocationRelevance,
  calculateLocationQuality,
  reverseGeocode
};
