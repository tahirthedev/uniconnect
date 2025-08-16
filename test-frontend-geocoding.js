// Test frontend reverse geocoding function
const reverseGeocode = async (lat, lng) => {
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
    
    const result = {
      city: city || '',
      area: address?.suburb || address?.neighbourhood || '',
      country: address?.country || ''
    };

    console.log('🎯 Frontend result:', result);
    return result;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {};
  }
};

// Test with the problematic coordinates
async function testFrontendGeocode() {
  console.log('Testing frontend reverse geocoding with coordinates 54.574327, -1.241113');
  const result = await reverseGeocode(54.574327, -1.241113);
  console.log('\n=== FRONTEND RESULT ===');
  console.log(result);
}

testFrontendGeocode();
