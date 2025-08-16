// Copy of the reverse geocoding function from locationUtils.js
const normalizeCity = (city) => {
  if (!city || typeof city !== 'string') return '';
  return city.trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function reverseGeocode(lat, lng) {
  try {
    console.log(`🌍 Reverse geocoding coordinates: ${lat}, ${lng}`);
    
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;
    console.log('📡 API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UniConnect/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📍 Raw API response:', JSON.stringify(data, null, 2));

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

// Test with the problematic coordinates
async function testGeocode() {
  console.log('Testing reverse geocoding with coordinates 54.574327, -1.241113');
  const result = await reverseGeocode(54.574327, -1.241113);
  console.log('\n=== FINAL RESULT ===');
  console.log(result);
}

testGeocode();
