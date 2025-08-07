// UK Cities Database with coordinates for location matching
// Focus on university towns and major cities for student accommodation

const ukCities = {
  // Major Cities
  'london': {
    name: 'London',
    lat: 51.5074,
    lng: -0.1278,
    region: 'Greater London',
    aliases: ['central london', 'greater london', 'london city', 'city of london'],
    isUniversityTown: true,
    majorUniversities: ['UCL', 'Imperial College', 'King\'s College', 'LSE', 'Queen Mary']
  },
  'manchester': {
    name: 'Manchester',
    lat: 53.4808,
    lng: -2.2426,
    region: 'Greater Manchester',
    aliases: ['manchester city', 'greater manchester'],
    isUniversityTown: true,
    majorUniversities: ['University of Manchester', 'Manchester Metropolitan']
  },
  'birmingham': {
    name: 'Birmingham',
    lat: 52.4862,
    lng: -1.8904,
    region: 'West Midlands',
    aliases: ['birmingham city', 'brum'],
    isUniversityTown: true,
    majorUniversities: ['University of Birmingham', 'Birmingham City University']
  },
  'leeds': {
    name: 'Leeds',
    lat: 53.8008,
    lng: -1.5491,
    region: 'West Yorkshire',
    aliases: ['leeds city'],
    isUniversityTown: true,
    majorUniversities: ['University of Leeds', 'Leeds Beckett University']
  },
  'liverpool': {
    name: 'Liverpool',
    lat: 53.4084,
    lng: -2.9916,
    region: 'Merseyside',
    aliases: ['liverpool city'],
    isUniversityTown: true,
    majorUniversities: ['University of Liverpool', 'Liverpool John Moores']
  },
  'glasgow': {
    name: 'Glasgow',
    lat: 55.8642,
    lng: -4.2518,
    region: 'Scotland',
    aliases: ['glasgow city'],
    isUniversityTown: true,
    majorUniversities: ['University of Glasgow', 'University of Strathclyde']
  },
  'edinburgh': {
    name: 'Edinburgh',
    lat: 55.9533,
    lng: -3.1883,
    region: 'Scotland',
    aliases: ['edinburgh city'],
    isUniversityTown: true,
    majorUniversities: ['University of Edinburgh', 'Edinburgh Napier University']
  },
  'bristol': {
    name: 'Bristol',
    lat: 51.4545,
    lng: -2.5879,
    region: 'South West England',
    aliases: ['bristol city'],
    isUniversityTown: true,
    majorUniversities: ['University of Bristol', 'University of the West of England']
  },
  'nottingham': {
    name: 'Nottingham',
    lat: 52.9548,
    lng: -1.1581,
    region: 'East Midlands',
    aliases: ['nottingham city', 'notts'],
    isUniversityTown: true,
    majorUniversities: ['University of Nottingham', 'Nottingham Trent University']
  },
  'sheffield': {
    name: 'Sheffield',
    lat: 53.3811,
    lng: -1.4701,
    region: 'South Yorkshire',
    aliases: ['sheffield city'],
    isUniversityTown: true,
    majorUniversities: ['University of Sheffield', 'Sheffield Hallam University']
  },
  'newcastle': {
    name: 'Newcastle',
    lat: 54.9783,
    lng: -1.6178,
    region: 'North East England',
    aliases: ['newcastle upon tyne', 'newcastle city'],
    isUniversityTown: true,
    majorUniversities: ['Newcastle University', 'Northumbria University']
  },
  'cardiff': {
    name: 'Cardiff',
    lat: 51.4816,
    lng: -3.1791,
    region: 'Wales',
    aliases: ['cardiff city', 'caerdydd'],
    isUniversityTown: true,
    majorUniversities: ['Cardiff University', 'Cardiff Metropolitan University']
  },
  'belfast': {
    name: 'Belfast',
    lat: 54.5973,
    lng: -5.9301,
    region: 'Northern Ireland',
    aliases: ['belfast city'],
    isUniversityTown: true,
    majorUniversities: ['Queen\'s University Belfast', 'Ulster University']
  },

  // University Towns
  'oxford': {
    name: 'Oxford',
    lat: 51.7520,
    lng: -1.2577,
    region: 'Oxfordshire',
    aliases: ['oxford city'],
    isUniversityTown: true,
    majorUniversities: ['University of Oxford', 'Oxford Brookes University']
  },
  'cambridge': {
    name: 'Cambridge',
    lat: 52.2053,
    lng: 0.1218,
    region: 'Cambridgeshire',
    aliases: ['cambridge city'],
    isUniversityTown: true,
    majorUniversities: ['University of Cambridge', 'Anglia Ruskin University']
  },
  'bath': {
    name: 'Bath',
    lat: 51.3758,
    lng: -2.3599,
    region: 'Somerset',
    aliases: ['bath city'],
    isUniversityTown: true,
    majorUniversities: ['University of Bath', 'Bath Spa University']
  },
  'york': {
    name: 'York',
    lat: 53.9600,
    lng: -1.0873,
    region: 'North Yorkshire',
    aliases: ['york city'],
    isUniversityTown: true,
    majorUniversities: ['University of York', 'York St John University']
  },
  'exeter': {
    name: 'Exeter',
    lat: 50.7184,
    lng: -3.5339,
    region: 'Devon',
    aliases: ['exeter city'],
    isUniversityTown: true,
    majorUniversities: ['University of Exeter']
  },
  'warwick': {
    name: 'Warwick',
    lat: 52.2819,
    lng: -1.5849,
    region: 'Warwickshire',
    aliases: ['warwick city', 'coventry'],
    isUniversityTown: true,
    majorUniversities: ['University of Warwick', 'Coventry University']
  },
  'leicester': {
    name: 'Leicester',
    lat: 52.6369,
    lng: -1.1398,
    region: 'Leicestershire',
    aliases: ['leicester city'],
    isUniversityTown: true,
    majorUniversities: ['University of Leicester', 'De Montfort University']
  },
  'southampton': {
    name: 'Southampton',
    lat: 50.9097,
    lng: -1.4044,
    region: 'Hampshire',
    aliases: ['southampton city'],
    isUniversityTown: true,
    majorUniversities: ['University of Southampton', 'Southampton Solent University']
  },
  'durham': {
    name: 'Durham',
    lat: 54.7761,
    lng: -1.5733,
    region: 'County Durham',
    aliases: ['durham city'],
    isUniversityTown: true,
    majorUniversities: ['Durham University']
  },
  'st andrews': {
    name: 'St Andrews',
    lat: 56.3398,
    lng: -2.7967,
    region: 'Scotland',
    aliases: ['saint andrews', 'st. andrews'],
    isUniversityTown: true,
    majorUniversities: ['University of St Andrews']
  }
};

// Create reverse lookup maps for efficient searching
const cityByName = {};
const cityByAlias = {};
const citiesByRegion = {};

// Build lookup maps
Object.keys(ukCities).forEach(key => {
  const city = ukCities[key];
  
  // Name lookup
  cityByName[city.name.toLowerCase()] = { key, ...city };
  cityByName[key] = { key, ...city };
  
  // Alias lookup
  city.aliases.forEach(alias => {
    cityByAlias[alias.toLowerCase()] = { key, ...city };
  });
  
  // Region lookup
  if (!citiesByRegion[city.region]) {
    citiesByRegion[city.region] = [];
  }
  citiesByRegion[city.region].push({ key, ...city });
});

/**
 * Find a city by name or alias (case-insensitive)
 * @param {string} searchTerm - City name or alias to search for
 * @returns {Object|null} - City object or null if not found
 */
function findCity(searchTerm) {
  if (!searchTerm) return null;
  
  const term = searchTerm.toLowerCase().trim();
  
  // Direct name match
  if (cityByName[term]) return cityByName[term];
  
  // Alias match
  if (cityByAlias[term]) return cityByAlias[term];
  
  // Partial match in city names
  const nameMatch = Object.keys(cityByName).find(name => 
    name.includes(term) || term.includes(name)
  );
  if (nameMatch) return cityByName[nameMatch];
  
  // Partial match in aliases
  const aliasMatch = Object.keys(cityByAlias).find(alias => 
    alias.includes(term) || term.includes(alias)
  );
  if (aliasMatch) return cityByAlias[aliasMatch];
  
  return null;
}

/**
 * Get nearby cities within a radius
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array} - Array of nearby cities
 */
function getNearbyCities(lat, lng, radiusKm = 50) {
  const nearbyCities = [];
  
  Object.keys(ukCities).forEach(key => {
    const city = ukCities[key];
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    
    if (distance <= radiusKm) {
      nearbyCities.push({
        key,
        ...city,
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
      });
    }
  });
  
  // Sort by distance
  return nearbyCities.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Get all university towns
 * @returns {Array} - Array of university towns
 */
function getUniversityTowns() {
  return Object.keys(ukCities)
    .filter(key => ukCities[key].isUniversityTown)
    .map(key => ({ key, ...ukCities[key] }));
}

module.exports = {
  ukCities,
  findCity,
  getNearbyCities,
  calculateDistance,
  getUniversityTowns,
  cityByName,
  cityByAlias,
  citiesByRegion
};
