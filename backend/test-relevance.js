const { CATEGORY_MAPPINGS } = require('./utils/searchUtils');

// Test the relevance scoring logic
function calculateRelevanceScore(post, searchTerms, originalSearch) {
  let score = 0;
  const title = post.title.toLowerCase();
  const description = post.description.toLowerCase();
  const category = post.category;
  const city = post.location.city.toLowerCase();
  const originalLower = originalSearch.toLowerCase();

  console.log(`\n=== Scoring: ${post.title} (${post.category}) ===`);

  // PRIORITY 1: Category matching (highest weight) - greatly increased
  const categoryWords = searchTerms.filter(term => CATEGORY_MAPPINGS[term.toLowerCase()]);
  if (categoryWords.length > 0) {
    const expectedCategory = CATEGORY_MAPPINGS[categoryWords[0].toLowerCase()];
    console.log(`Category word found: ${categoryWords[0]} -> expected: ${expectedCategory}, actual: ${category}`);
    if (category === expectedCategory || 
        (expectedCategory === 'pick-drop' && category === 'ridesharing')) {
      score += 5000;
      console.log(`+5000 for category match: ${score}`);
    }
  }

  // PRIORITY 2: Direct category match for ridesharing/pick-drop
  if ((category === 'ridesharing' || category === 'pick-drop') && 
      (originalLower.includes('ride') || originalLower.includes('lift') || originalLower.includes('car'))) {
    score += 3000;
    console.log(`+3000 for ride category bonus: ${score}`);
  }

  // PRIORITY 6: Penalty for accommodation when searching for rides
  if ((originalLower.includes('ride') || originalLower.includes('lift') || originalLower.includes('car')) && 
      category === 'accommodation') {
    score -= 1000;
    console.log(`-1000 penalty for accommodation in ride search: ${score}`);
  }

  console.log(`Final score: ${Math.max(0, score)}`);
  return Math.max(0, score);
}

// Test data
const searchQuery = "ride to manchester";
const searchTerms = searchQuery.split(/\s+/).filter(word => word.length > 2);

const testPosts = [
  {
    title: "Roommate-Wanted - manchester",
    description: "Looking for roommate",
    category: "accommodation",
    location: { city: "manchester" }
  },
  {
    title: "Test ride from London to Oxford", 
    description: "Test ride description",
    category: "ridesharing",
    location: { city: "London" }
  },
  {
    title: "Central Manchester",
    description: "Apartment in Manchester",
    category: "accommodation", 
    location: { city: "London" }
  }
];

console.log(`Search: "${searchQuery}"`);
console.log(`Search terms: [${searchTerms.join(', ')}]`);
console.log(`Category mappings:`, CATEGORY_MAPPINGS);

testPosts.forEach(post => {
  calculateRelevanceScore(post, searchTerms, searchQuery);
});
