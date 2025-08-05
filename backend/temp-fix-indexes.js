const mongoose = require('mongoose');

// Temporary script to fix duplicate geospatial indexes
// This will be deleted after fixing the issue

async function fixGeospatialIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniconnect');
    console.log('🔧 Connected to MongoDB to fix indexes');

    const db = mongoose.connection.db;
    const collection = db.collection('posts');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // Find 2dsphere indexes
    const geoIndexes = indexes.filter(index => 
      Object.values(index.key).some(value => value === '2dsphere')
    );

    console.log(`🌍 Found ${geoIndexes.length} geospatial indexes`);

    // Drop all geospatial indexes except the correct one
    for (let index of geoIndexes) {
      if (index.name !== 'location.geoLocation_2dsphere') {
        console.log(`🗑️ Dropping index: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }

    // Ensure the correct index exists
    try {
      await collection.createIndex({ "location.geoLocation": "2dsphere" });
      console.log('✅ Created/ensured correct geospatial index: location.geoLocation_2dsphere');
    } catch (error) {
      console.log('✅ Correct geospatial index already exists');
    }

    // List indexes again to verify
    const finalIndexes = await collection.indexes();
    console.log('📋 Final indexes:');
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔧 Disconnected from MongoDB');
  }
}

fixGeospatialIndexes();
