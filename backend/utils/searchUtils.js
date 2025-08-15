/**
 * Enhanced search utilities for better search functionality
 */

// Common synonyms and mappings
const SYNONYMS = {
  // Accommodation terms
  'house': ['home', 'property', 'residence'],
  'flat': ['apartment', 'unit'],
  'room': ['bedroom', 'space'],
  'housing': ['accommodation', 'lodging'],
  'studio': ['bedsit'],
  
  // Transportation terms
  'ride': ['lift', 'transport', 'trip'],
  'car': ['vehicle', 'auto'],
  'drive': ['driving'],
  
  // Job terms
  'job': ['work', 'employment', 'position'],
  'part-time': ['parttime', 'part time'],
  'full-time': ['fulltime', 'full time'],
  
  // Location terms
  'near': ['close', 'nearby', 'around'],
  'city': ['town', 'area'],
  'center': ['centre', 'central'],
  
  // Price terms
  'cheap': ['affordable', 'budget', 'low cost'],
  'expensive': ['costly', 'premium', 'high end']
};

// Category mappings for search terms
const CATEGORY_MAPPINGS = {
  'house': 'accommodation',
  'home': 'accommodation', 
  'flat': 'accommodation',
  'apartment': 'accommodation',
  'room': 'accommodation',
  'housing': 'accommodation',
  'accommodation': 'accommodation',
  'studio': 'accommodation',
  'bedsit': 'accommodation',
  
  'ride': 'pick-drop',
  'lift': 'pick-drop',
  'car': 'pick-drop',
  'transport': 'pick-drop',
  'driving': 'pick-drop',
  
  'job': 'jobs',
  'work': 'jobs',
  'employment': 'jobs',
  'position': 'jobs',
  'career': 'jobs',
  
  'buy': 'buy-sell',
  'sell': 'buy-sell',
  'marketplace': 'buy-sell',
  'shop': 'buy-sell',
  
  'currency': 'currency-exchange',
  'exchange': 'currency-exchange',
  'money': 'currency-exchange'
};

// UK city variations and common misspellings
const CITY_VARIATIONS = {
  'london': ['ldn', 'greater london'],
  'manchester': ['manc', 'mcr'],
  'birmingham': ['bham', 'birmingam'],
  'liverpool': ['lvpl', 'pool'],
  'newcastle': ['newcastle upon tyne', 'tyne', 'newcastle-upon-tyne'],
  'edinburgh': ['edinboro', 'edi'],
  'glasgow': ['gla'],
  'cardiff': ['caerdydd'],
  'bristol': ['bristle'],
  'leeds': ['leed'],
  'sheffield': ['sheff'],
  'leicester': ['lester'],
  'coventry': ['cov'],
  'nottingham': ['notts', 'nottinghamshire'],
  'oxford': ['oxf'],
  'cambridge': ['cam', 'cambs']
};

/**
 * Expand search terms with synonyms
 */
function expandWithSynonyms(word) {
  const lowerWord = word.toLowerCase();
  const expanded = [word];
  
  // Check if word has synonyms
  if (SYNONYMS[lowerWord]) {
    expanded.push(...SYNONYMS[lowerWord]);
  }
  
  // Check if word is a synonym of another word
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (synonyms.includes(lowerWord)) {
      expanded.push(key, ...synonyms.filter(s => s !== lowerWord));
    }
  }
  
  return [...new Set(expanded)]; // Remove duplicates
}

/**
 * Get category from search terms
 */
function extractCategoryFromSearch(searchTerms) {
  const categories = [];
  
  searchTerms.forEach(term => {
    const lowerTerm = term.toLowerCase();
    if (CATEGORY_MAPPINGS[lowerTerm]) {
      categories.push(CATEGORY_MAPPINGS[lowerTerm]);
    }
  });
  
  return [...new Set(categories)];
}

/**
 * Normalize city names for better matching
 */
function normalizeCityName(cityName) {
  const lowerCity = cityName.toLowerCase().trim();
  
  // Check variations
  for (const [standard, variations] of Object.entries(CITY_VARIATIONS)) {
    if (variations.includes(lowerCity) || lowerCity === standard) {
      return standard;
    }
  }
  
  return lowerCity;
}

/**
 * Extract location hints from search
 */
function extractLocationFromSearch(searchTerms) {
  const locationHints = [];
  const locationWords = ['in', 'at', 'near', 'around', 'close to'];
  
  for (let i = 0; i < searchTerms.length; i++) {
    const term = searchTerms[i].toLowerCase();
    
    // Check if this is a location preposition
    if (locationWords.includes(term) && i + 1 < searchTerms.length) {
      const nextTerm = searchTerms[i + 1];
      const normalizedCity = normalizeCityName(nextTerm);
      locationHints.push(normalizedCity);
    }
    
    // Direct city name check
    const normalizedTerm = normalizeCityName(term);
    if (Object.keys(CITY_VARIATIONS).includes(normalizedTerm) || 
        Object.values(CITY_VARIATIONS).flat().includes(normalizedTerm)) {
      locationHints.push(normalizedTerm);
    }
  }
  
  return [...new Set(locationHints)];
}

/**
 * Build enhanced search query with priority scoring
 */
function buildEnhancedSearchQuery(searchString, baseFilters = {}) {
  if (!searchString || !searchString.trim()) {
    return baseFilters;
  }
  
  const searchTerm = searchString.trim();
  const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 2);
  
  // Extract insights from search
  const categories = extractCategoryFromSearch(searchWords);
  const locations = extractLocationFromSearch(searchWords);
  
  // Build prioritized search conditions
  const searchConditions = [];
  
  // PRIORITY 1: Exact category match (highest priority)
  if (categories.length > 0) {
    categories.forEach(cat => {
      searchConditions.push({ 
        category: cat,
        _priority: 100 // Highest priority score
      });
    });
  }
  
  // PRIORITY 2: Title matches with category words
  searchWords.forEach(word => {
    const category = CATEGORY_MAPPINGS[word.toLowerCase()];
    if (category) {
      searchConditions.push({
        $and: [
          { category: category },
          { title: { $regex: word, $options: 'i' } }
        ],
        _priority: 90
      });
    }
  });
  
  // PRIORITY 3: Full phrase match in title
  searchConditions.push({
    title: { $regex: searchTerm, $options: 'i' },
    _priority: 80
  });
  
  // PRIORITY 4: Enhanced word matching with synonyms in title
  searchWords.forEach(word => {
    const expandedWords = expandWithSynonyms(word);
    expandedWords.forEach(expandedWord => {
      searchConditions.push({
        title: { $regex: expandedWord, $options: 'i' },
        _priority: 70
      });
    });
  });
  
  // PRIORITY 5: Location matches (but lower priority than service type)
  if (locations.length > 0) {
    locations.forEach(location => {
      searchConditions.push({
        'location.city': { $regex: location, $options: 'i' },
        _priority: 60
      });
      searchConditions.push({
        'location.address': { $regex: location, $options: 'i' },
        _priority: 55
      });
    });
  }
  
  // PRIORITY 6: Full phrase match in description
  searchConditions.push({
    description: { $regex: searchTerm, $options: 'i' },
    _priority: 50
  });
  
  // PRIORITY 7: Enhanced word matching in description
  searchWords.forEach(word => {
    const expandedWords = expandWithSynonyms(word);
    expandedWords.forEach(expandedWord => {
      searchConditions.push({
        description: { $regex: expandedWord, $options: 'i' },
        _priority: 40
      });
    });
  });
  
  // PRIORITY 8: General location matches without category preference
  searchWords.forEach(word => {
    const normalizedCity = normalizeCityName(word);
    if (Object.keys(CITY_VARIATIONS).includes(normalizedCity) || 
        Object.values(CITY_VARIATIONS).flat().includes(normalizedCity)) {
      searchConditions.push({
        'location.city': { $regex: normalizedCity, $options: 'i' },
        _priority: 30
      });
    }
  });
  
  // Remove priority markers for actual query (MongoDB doesn't need them)
  const cleanConditions = searchConditions.map(condition => {
    const { _priority, ...cleanCondition } = condition;
    return cleanCondition;
  });
  
  return {
    ...baseFilters,
    $or: cleanConditions
  };
}

module.exports = {
  expandWithSynonyms,
  extractCategoryFromSearch,
  normalizeCityName,
  extractLocationFromSearch,
  buildEnhancedSearchQuery,
  SYNONYMS,
  CATEGORY_MAPPINGS,
  CITY_VARIATIONS
};
