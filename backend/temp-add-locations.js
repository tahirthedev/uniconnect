const mongoose = require('mongoose');
const Post = require('./models/Post');

// Temporary script to add location data to existing posts for testing
// This will be deleted after Phase 2 is complete

// Sample UK university city coordinates
const ukCityCoordinates = {
  'London': { lat: 51.5074, lng: -0.1278 },
  'Manchester': { lat: 53.4808, lng: -2.2426 },
  'Birmingham': { lat: 52.4862, lng: -1.8904 },
  'Leeds': { lat: 53.8008, lng: -1.5491 },
  'Glasgow': { lat: 55.8642, lng: -4.2518 },
  'Liverpool': { lat: 53.4084, lng: -2.9916 },
  'Sheffield': { lat: 53.3811, lng: -1.4701 },
  'Edinburgh': { lat: 55.9533, lng: -3.1883 },
  'Bristol': { lat: 51.4545, lng: -2.5879 },
  'Cardiff': { lat: 51.4816, lng: -3.1791 },
  'Newcastle': { lat: 54.9783, lng: -1.6178 },
  'Nottingham': { lat: 52.9548, lng: -1.1581 }
};

const cities = Object.keys(ukCityCoordinates);

async function addLocationsToPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniconnect');
    console.log('📍 Connected to MongoDB');

    // Get all posts without coordinates
    const postsWithoutCoords = await Post.find({
      $or: [
        { 'location.coordinates.latitude': { $exists: false } },
        { 'location.coordinates.longitude': { $exists: false } },
        { 'location.coordinates.latitude': null },
        { 'location.coordinates.longitude': null }
      ]
    });

    console.log(`📍 Found ${postsWithoutCoords.length} posts without coordinates`);

    for (let post of postsWithoutCoords) {
      // Use existing city or assign a random one
      let cityName = post.location?.city;
      
      if (!cityName || !ukCityCoordinates[cityName]) {
        cityName = cities[Math.floor(Math.random() * cities.length)];
        post.location.city = cityName;
      }

      const coords = ukCityCoordinates[cityName];
      
      // Add some random offset (within ~2km) to make locations more realistic
      const latOffset = (Math.random() - 0.5) * 0.02; // ~1.1km per 0.01 degree
      const lngOffset = (Math.random() - 0.5) * 0.02;

      post.location.coordinates = {
        latitude: coords.lat + latOffset,
        longitude: coords.lng + lngOffset
      };

      post.location.country = 'UK';
      
      await post.save();
      console.log(`📍 Updated post "${post.title}" with location: ${cityName} (${post.location.coordinates.latitude}, ${post.location.coordinates.longitude})`);
    }

    console.log('📍 Finished adding locations to posts');
    
    // Create geospatial index if it doesn't exist
    try {
      await Post.collection.createIndex({ "location.geoLocation": "2dsphere" });
      console.log('📍 Created geospatial index on location.geoLocation');
    } catch (indexError) {
      console.log('📍 Geospatial index may already exist:', indexError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📍 Disconnected from MongoDB');
  }
}

addLocationsToPosts();
