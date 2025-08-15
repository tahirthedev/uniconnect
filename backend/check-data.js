const mongoose = require('mongoose');
require('./config/database'); // Connect to database
const Post = require('./models/Post');

async function checkData() {
  try {
    const posts = await Post.find({});
    
    console.log('=== TOTAL POSTS ===');
    console.log('Total posts:', posts.length);
    
    console.log('\n=== POSTS BY CATEGORY ===');
    const byCategory = {};
    posts.forEach(post => {
      byCategory[post.category] = (byCategory[post.category] || 0) + 1;
    });
    console.log(byCategory);
    
    console.log('\n=== POSTS BY CITY ===');
    const byCity = {};
    posts.forEach(post => {
      const city = post.location.city;
      byCity[city] = (byCity[city] || 0) + 1;
    });
    console.log(byCity);
    
    console.log('\n=== SAMPLE POSTS ===');
    posts.slice(0, 8).forEach((post, i) => {
      console.log(`${i+1}. ${post.title}`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Location: ${post.location.city}, ${post.location.country}`);
      console.log(`   Description: ${post.description.substring(0, 80)}...`);
      console.log('');
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
