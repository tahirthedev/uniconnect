const mongoose = require('mongoose');
const Post = require('./models/Post');

// Load environment variables if running locally
try {
  require('dotenv').config();
} catch (error) {
  // dotenv might not be available in production
}

// Normalize city names
const normalizeCity = (city) => {
  if (!city || typeof city !== 'string') return '';
  return city.trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function fixCityNames() {
  try {
    // Load environment variables if not in Railway environment
    if (!process.env.RAILWAY_ENVIRONMENT) {
      require('dotenv').config();
    }
    
    // Connect to MongoDB using the environment variable
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/uniconnect';
    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 Environment:', process.env.RAILWAY_ENVIRONMENT || 'local');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all posts with location.city
    const posts = await Post.find({ 'location.city': { $exists: true, $ne: null } });
    console.log(`📊 Found ${posts.length} posts with city data`);

    let updatedCount = 0;
    let duplicatesFound = [];

    for (const post of posts) {
      const originalCity = post.location.city;
      const normalizedCity = normalizeCity(originalCity);
      
      // Only update if normalization changed the city name
      if (originalCity !== normalizedCity) {
        console.log(`🔄 Updating "${originalCity}" → "${normalizedCity}" for post ${post._id}`);
        
        await Post.findByIdAndUpdate(post._id, {
          'location.city': normalizedCity
        });
        
        updatedCount++;
        
        // Track potential duplicates
        if (originalCity.toLowerCase() === normalizedCity.toLowerCase() && originalCity !== normalizedCity) {
          duplicatesFound.push({ original: originalCity, normalized: normalizedCity });
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`📊 Updated ${updatedCount} posts`);
    
    if (duplicatesFound.length > 0) {
      console.log(`\n🔍 Duplicate variations found and normalized:`);
      duplicatesFound.forEach(({ original, normalized }) => {
        console.log(`   "${original}" → "${normalized}"`);
      });
    }

    // Show final city statistics
    const uniqueCities = await Post.distinct('location.city');
    console.log(`\n📍 Final unique cities: ${uniqueCities.length}`);
    console.log('Cities:', uniqueCities.sort());

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  fixCityNames();
}

module.exports = { fixCityNames, normalizeCity };
