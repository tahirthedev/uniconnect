require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Post = require('./models/Post');
const { DailyAnalytics, MonthlyAnalytics } = require('./models/Analytics');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@uniconnect.com',
      role: 'admin',
      isActive: true,
      verifiedAt: new Date(),
      totalPosts: 0,
      totalMessages: 0
    });
    await adminUser.save();
    console.log('✅ Created admin user');

    // Create moderator user
    const moderatorUser = new User({
      name: 'Moderator User',
      email: 'moderator@uniconnect.com',
      role: 'moderator',
      isActive: true,
      verifiedAt: new Date(),
      totalPosts: 0,
      totalMessages: 0
    });
    await moderatorUser.save();
    console.log('✅ Created moderator user');

    // Create sample regular users
    const users = [];
    const userNames = [
      'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson', 
      'David Brown', 'Lisa Garcia', 'Tom Anderson', 'Maria Rodriguez'
    ];

    for (let i = 0; i < userNames.length; i++) {
      const user = new User({
        name: userNames[i],
        email: `user${i + 1}@example.com`,
        role: 'user',
        isActive: true,
        verifiedAt: new Date(),
        totalPosts: 0,
        totalMessages: 0,
        lastActive: new Date()
      });
      await user.save();
      users.push(user);
    }
    console.log('✅ Created sample users');

    // Create sample posts
    const samplePosts = [
      {
        title: 'Daily Ride from Downtown to University',
        description: 'Looking for people to share daily commute from downtown Manhattan to Columbia University. Leaving at 8 AM sharp every weekday. Non-smoking car, friendly environment.',
        category: 'ridesharing',
        location: { city: 'New York', state: 'NY', country: 'US' },
        price: { amount: 15, currency: 'USD', type: 'daily' },
        details: {
          ride: {
            from: 'Downtown Manhattan',
            to: 'Columbia University',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            time: '8:00 AM',
            seats: 3,
            recurring: true,
            vehicle: 'Honda Civic'
          }
        },
        priority: 'featured'
      },
      {
        title: 'MacBook Pro M3 - Like New Condition',
        description: 'Selling my MacBook Pro M3 14-inch in excellent condition. Used for only 6 months, still has warranty. Comes with original charger and box. Perfect for students.',
        category: 'buy-sell',
        location: { city: 'San Francisco', state: 'CA', country: 'US' },
        price: { amount: 1899, currency: 'USD', type: 'fixed' },
        details: {
          item: {
            condition: 'like-new',
            brand: 'Apple',
            model: 'MacBook Pro M3 14-inch',
            specifications: ['14-inch display', '512GB SSD', '16GB RAM', 'M3 chip'],
            warranty: '6 months remaining'
          }
        },
        images: [{ url: '/placeholder.svg?height=300&width=400', isPrimary: true }]
      },
      {
        title: 'Frontend React Developer Position',
        description: 'TechStart Inc. is looking for a passionate React developer to join our growing team. Great opportunity for recent graduates or students looking for part-time work.',
        category: 'jobs',
        location: { city: 'Remote', country: 'US' },
        price: { amount: 75, currency: 'USD', type: 'hourly' },
        details: {
          job: {
            type: 'part-time',
            company: 'TechStart Inc.',
            salary: { min: 70000, max: 90000, period: 'year' },
            requirements: ['React', 'TypeScript', 'Node.js', '2+ years experience'],
            benefits: ['Health insurance', 'Flexible hours', 'Remote work'],
            remote: true
          }
        },
        priority: 'urgent'
      },
      {
        title: 'Cozy Room Near Columbia University',
        description: 'Beautiful private room available in a shared apartment just 0.3 miles from Columbia University. Fully furnished with WiFi, kitchen access, and study area.',
        category: 'accommodation',
        location: { city: 'New York', state: 'NY', country: 'US' },
        price: { amount: 850, currency: 'USD', type: 'monthly' },
        details: {
          accommodation: {
            type: 'private-room',
            bedrooms: 1,
            bathrooms: 1,
            furnishing: 'furnished',
            amenities: ['WiFi', 'Kitchen', 'Laundry', 'Study Area'],
            moveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            leaseTerm: '6 months minimum',
            petsAllowed: false
          }
        },
        images: [{ url: '/placeholder.svg?height=300&width=400', isPrimary: true }]
      },
      {
        title: 'Airport Pickup Service - LAX',
        description: 'Reliable airport pickup and drop-off service from LAX to anywhere in LA area. Clean car, safe driver, competitive rates. Available 24/7.',
        category: 'pick-drop',
        location: { city: 'Los Angeles', state: 'CA', country: 'US' },
        price: { amount: 35, currency: 'USD', type: 'fixed' }
      },
      {
        title: 'USD to EUR Exchange - Better Rates',
        description: 'Looking to exchange USD to EUR at better rates than banks. Have $5000 USD, need EUR. Can meet in person in safe public location.',
        category: 'currency-exchange',
        location: { city: 'Boston', state: 'MA', country: 'US' },
        details: {
          currency: {
            from: 'USD',
            to: 'EUR',
            rate: 0.92,
            amount: 5000
          }
        }
      }
    ];

    // Assign random authors and create posts
    for (let i = 0; i < samplePosts.length; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      samplePosts[i].author = randomUser._id;
      
      const post = new Post(samplePosts[i]);
      await post.save();
      
      // Update user's post count
      await User.findByIdAndUpdate(randomUser._id, { $inc: { totalPosts: 1 } });
    }
    console.log('✅ Created sample posts');

    // Initialize analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyAnalytics = new DailyAnalytics({
      date: today,
      users: {
        totalActive: users.length + 2, // including admin and moderator
        newRegistrations: users.length + 2,
        totalUsers: users.length + 2
      },
      posts: {
        total: samplePosts.length,
        byCategory: {
          ridesharing: 1,
          'buy-sell': 1,
          jobs: 1,
          accommodation: 1,
          'pick-drop': 1,
          'currency-exchange': 1
        }
      },
      messages: { total: 0 },
      reports: { total: 0, resolved: 0, pending: 0 }
    });
    await dailyAnalytics.save();

    const monthlyAnalytics = new MonthlyAnalytics({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      users: {
        totalActive: users.length + 2,
        newRegistrations: users.length + 2,
        totalUsers: users.length + 2,
        retention: 100
      },
      posts: {
        total: samplePosts.length,
        byCategory: {
          ridesharing: 1,
          'buy-sell': 1,
          jobs: 1,
          accommodation: 1,
          'pick-drop': 1,
          'currency-exchange': 1
        }
      },
      engagement: {
        totalViews: 0,
        totalLikes: 0,
        totalMessages: 0,
        averagePostsPerUser: samplePosts.length / (users.length + 2)
      },
      moderation: {
        totalReports: 0,
        resolvedReports: 0,
        bannedUsers: 0,
        flaggedPosts: 0
      }
    });
    await monthlyAnalytics.save();
    console.log('✅ Created initial analytics');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Seeded data summary:');
    console.log(`- Admin user: admin@uniconnect.com`);
    console.log(`- Moderator user: moderator@uniconnect.com`);
    console.log(`- Regular users: ${users.length}`);
    console.log(`- Sample posts: ${samplePosts.length}`);
    console.log('\n🔐 Default credentials:');
    console.log('- All users are created without passwords (OAuth only)');
    console.log('- To add password login, use the /auth/register endpoint');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Database connection closed');
  }
};

const main = async () => {
  await connectDB();
  await seedData();
};

// Run the seeder
if (require.main === module) {
  main();
}

module.exports = { seedData };
