const { findCity, getNearbyCities, calculateDistance } = require('./ukCities');

/**
 * Smart location matching for accommodation posts
 * Handles various location input formats and provides intelligent fallbacks
 */

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
  
  // For non-accommodation categories, use existing logic
  if (category !== 'accommodation') {
    return buildStandardLocationQuery(params);
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
function buildStandardLocationQuery({ lat, lng, radius = 20, city }) {
  const metadata = {
    searchType: 'standard',
    fallbacksUsed: []
  };
  
  // GPS-based search
  if (lat && lng) {
    const query = {
      'location.coordinates': {
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
  calculateLocationQuality
};
