const Post = require('../models/Post');
const User = require('../models/User');
const { UserActivity } = require('../models/Analytics');
const { detectFlaggedContent, shouldAutoFlag } = require('../utils/moderation');
const { buildLocationQuery, addLocationMetadata, sortByLocationRelevance } = require('../utils/locationUtils');
const { buildEnhancedSearchQuery, extractCategoryFromSearch, CATEGORY_MAPPINGS } = require('../utils/searchUtils');

// Helper function to normalize city names
const normalizeCity = (city) => {
  if (!city || typeof city !== 'string') return '';
  return city.trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Calculate relevance score for search results
function calculateRelevanceScore(post, searchTerms, originalSearch) {
  let score = 0;
  const title = post.title.toLowerCase();
  const description = post.description.toLowerCase();
  const category = post.category;
  const city = post.location.city.toLowerCase();
  const originalLower = originalSearch.toLowerCase();

  // PRIORITY 1: Category matching (highest weight) - greatly increased
  const categoryWords = searchTerms.filter(term => CATEGORY_MAPPINGS[term.toLowerCase()]);
  if (categoryWords.length > 0) {
    const expectedCategory = CATEGORY_MAPPINGS[categoryWords[0].toLowerCase()];
    if (category === expectedCategory || 
        (expectedCategory === 'pick-drop' && category === 'ridesharing')) {
      score += 5000; // Very high score for correct category
    }
  }

  // PRIORITY 2: Direct category match for ridesharing/pick-drop
  if ((category === 'ridesharing' || category === 'pick-drop') && 
      (originalLower.includes('ride') || originalLower.includes('lift') || originalLower.includes('car'))) {
    score += 3000; // High bonus for ride-related searches matching ride categories
  }

  // PRIORITY 3: Title matches (high weight)
  if (title.includes(originalLower)) {
    score += 500; // Full phrase in title
  }
  
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    if (title.includes(termLower)) {
      score += 200; // Individual words in title
    }
    if (title.startsWith(termLower)) {
      score += 100; // Word at start of title
    }
  });

  // PRIORITY 4: Description matches (medium weight)  
  if (description.includes(originalLower)) {
    score += 150; // Full phrase in description
  }
  
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    if (description.includes(termLower)) {
      score += 50; // Individual words in description
    }
  });

  // PRIORITY 5: Location matches (much lower weight for location-only matches)
  // But penalize wrong category + location matches
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    if (city.includes(termLower)) {
      // If this is a location match but wrong category for the search intent
      const categoryWords = searchTerms.filter(searchTerm => CATEGORY_MAPPINGS[searchTerm.toLowerCase()]);
      if (categoryWords.length > 0) {
        const expectedCategory = CATEGORY_MAPPINGS[categoryWords[0].toLowerCase()];
        if (category !== expectedCategory && 
            !(expectedCategory === 'pick-drop' && category === 'ridesharing')) {
          score += 5; // Very low score for wrong category but location match
        } else {
          score += 100; // Good score for correct category + location
        }
      } else {
        score += 30; // Normal location match
      }
    }
  });

  // PRIORITY 6: Penalty for accommodation when searching for rides
  if ((originalLower.includes('ride') || originalLower.includes('lift') || originalLower.includes('car')) && 
      category === 'accommodation') {
    score -= 1000; // Significant penalty for accommodation posts in ride searches
  }

  // PRIORITY 7: Penalty for jobs when searching for accommodation terms
  if ((originalLower.includes('house') || originalLower.includes('flat') || originalLower.includes('apartment')) && 
      category === 'jobs') {
    score -= 1000; // Significant penalty for job posts in accommodation searches
  }

  // BONUS: Recent posts get slight boost
  const daysSinceCreated = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) {
    score += 10; // Recent posts bonus
  }

  return Math.max(0, score); // Ensure score never goes negative
}

// Create a new post
const createPost = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      images,
      price,
      location,
      contact,
      details
    } = req.body;

    // Content moderation check
    const contentAnalysis = detectFlaggedContent(`${title} ${description}`);
    
    // Normalize city name in location
    const normalizedLocation = { ...location };
    if (normalizedLocation && normalizedLocation.city) {
      normalizedLocation.city = normalizeCity(normalizedLocation.city);
    }
    
    const postData = {
      title,
      description,
      category,
      author: req.user._id,
      location: normalizedLocation,
      status: 'active'
    };

    // Optional fields
    if (subcategory) postData.subcategory = subcategory;
    if (images) postData.images = images;
    if (price) postData.price = price;
    if (contact) postData.contact = contact;
    if (details) postData.details = details;

    // Apply moderation results
    if (contentAnalysis.isFlagged) {
      postData.moderation = {
        isFlagged: true,
        flagReason: 'Auto-flagged for suspicious content',
        flaggedAt: new Date(),
        autoFlagged: true,
        flaggedKeywords: contentAnalysis.detectedKeywords
      };

      if (shouldAutoFlag(contentAnalysis)) {
        postData.status = 'flagged';
      }
    }

    const post = new Post(postData);
    await post.save();
    await post.populate('author', 'name avatar');

    // Update user's post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalPosts: 1 } });

    // Log user activity
    await UserActivity.logActivity(req.user._id, 'postsCreated');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: post,
      moderation: contentAnalysis.isFlagged ? {
        flagged: true,
        severity: contentAnalysis.severity,
        message: 'Your post has been flagged for review due to potentially inappropriate content.'
      } : null
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all posts with filters
const getPosts = async (req, res) => {
  try {
    const {
      category,
      city,
      priceMin,
      priceMax,
      page = 1,
      limit = 20,
      sort = 'recent',
      lat,
      lng,
      radius = 20, // radius in kilometers
      search // search query parameter
    } = req.query;

    // Build smart location query using new system
    const locationResult = buildLocationQuery({ category, lat, lng, radius, city });
    const { query: locationQuery, metadata: locationMetadata } = locationResult;

    // Base filters (always applied)
    const baseFilters = {
      status: 'active',
      expiresAt: { $gt: new Date() }
    };

    // Apply category filter
    if (category) {
      baseFilters.category = category;
    }

    // Apply price filters
    if (priceMin || priceMax) {
      baseFilters['price.amount'] = {};
      if (priceMin) baseFilters['price.amount'].$gte = parseFloat(priceMin);
      if (priceMax) baseFilters['price.amount'].$lte = parseFloat(priceMax);
    }

    // Apply enhanced search filter using the new search utility
    let searchTerms = null;
    if (search && search.trim()) {
      searchTerms = search.trim().split(/\s+/).filter(word => word.length > 2);
      const enhancedQuery = buildEnhancedSearchQuery(search, baseFilters);
      Object.assign(baseFilters, enhancedQuery);
    }

    // Combine base filters with location query
    const finalQuery = {
      ...baseFilters,
      ...locationQuery
    };

    // Sorting options
    let sortOptions = {};
    switch (sort) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'price-low':
        sortOptions = { 'price.amount': 1, createdAt: -1 };
        break;
      case 'price-high':
        sortOptions = { 'price.amount': -1, createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { views: -1, createdAt: -1 };
        break;
      case 'location':
        // Location-based sorting will be handled post-query
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { priority: -1, createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [posts, totalCount] = await Promise.all([
      Post.find(finalQuery)
        .populate('author', 'name avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(finalQuery)
    ]);

    // Add like counts and user's like status
    let enhancedPosts = posts.map(post => ({
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      isLiked: req.user ? post.likes?.includes(req.user._id) : false,
      likes: undefined // Remove the likes array from response
    }));

    // Apply smart relevance sorting for search results
    if (search && searchTerms && searchTerms.length > 0) {
      enhancedPosts = enhancedPosts.map(post => ({
        ...post,
        relevanceScore: calculateRelevanceScore(post, searchTerms, search)
      }));

      // Sort by relevance score (highest first), then by date
      enhancedPosts.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      // Remove relevance score from final response
      enhancedPosts = enhancedPosts.map(post => {
        const { relevanceScore, ...postWithoutScore } = post;
        return postWithoutScore;
      });
    }

    // Add location metadata and sort by location relevance if requested
    const userLocation = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
    
    if (category === 'accommodation' && userLocation) {
      enhancedPosts = addLocationMetadata(enhancedPosts, userLocation);
      
      if (sort === 'location') {
        enhancedPosts = sortByLocationRelevance(enhancedPosts, userLocation);
      }
    }

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Prepare response with enhanced metadata
    const response = {
      success: true,
      posts: enhancedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      location: {
        ...locationMetadata,
        userLocation,
        searchRadius: radius
      }
    };

    // Add helpful suggestions if no posts found
    if (enhancedPosts.length === 0 && category === 'accommodation') {
      response.suggestions = generateAccommodationSuggestions(locationMetadata, userLocation);
    }
    res.json(response);

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate helpful suggestions when no accommodation posts are found
 */
function generateAccommodationSuggestions(locationMetadata, userLocation) {
  const suggestions = [];
  
  if (locationMetadata.fallbacksUsed.includes('gps_and_cities') && locationMetadata.searchArea?.nearbyCities) {
    suggestions.push({
      type: 'expand_search',
      message: `No accommodations found nearby. Try searching in ${locationMetadata.searchArea.nearbyCities.map(c => c.name).join(', ')}`
    });
  }
  
  if (locationMetadata.fallbacksUsed.includes('city_based') && locationMetadata.searchArea?.foundCity) {
    suggestions.push({
      type: 'nearby_cities',
      message: `No accommodations in ${locationMetadata.searchArea.foundCity}. Check nearby areas or try a broader search.`
    });
  }
  
  if (locationMetadata.fallbacksUsed.includes('show_all')) {
    suggestions.push({
      type: 'enable_location',
      message: 'Enable location services to see accommodations near you, or search by city name.'
    });
  }
  
  // Always suggest major university cities
  suggestions.push({
    type: 'popular_cities',
    message: 'Try searching in popular student cities: London, Manchester, Birmingham, Leeds, Liverpool'
  });
  
  return suggestions;
}

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'name avatar email phone preferences')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post is active or if user is author/moderator
    if (post.status !== 'active' && 
        (!req.user || 
         (req.user._id.toString() !== post.author._id.toString() && 
          !['admin', 'moderator'].includes(req.user.role)))) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count (async, don't wait)
    Post.findByIdAndUpdate(postId, { $inc: { views: 1 } }).catch(() => {});

    // Log user activity if authenticated
    if (req.user) {
      UserActivity.logActivity(req.user._id, 'postsViewed').catch(() => {});
    }

    // Prepare response
    const responsePost = {
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      isLiked: req.user ? post.likes?.includes(req.user._id) : false,
      likes: undefined, // Remove the likes array from response
      // Show contact info based on privacy settings and user relationship
      author: {
        ...post.author,
        email: (post.author.preferences?.privacy?.showEmail || 
                req.user?._id.toString() === post.author._id.toString()) 
                ? post.author.email : undefined,
        phone: (post.author.preferences?.privacy?.showPhone || 
                req.user?._id.toString() === post.author._id.toString()) 
                ? post.author.phone : undefined
      }
    };

    res.json({
      success: true,
      post: responsePost
    });

  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const updates = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership or admin/moderator role
    if (post.author.toString() !== req.user._id.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Content moderation for title/description updates
    if (updates.title || updates.description) {
      const content = `${updates.title || post.title} ${updates.description || post.description}`;
      const contentAnalysis = detectFlaggedContent(content);
      
      if (contentAnalysis.isFlagged && shouldAutoFlag(contentAnalysis)) {
        updates.status = 'flagged';
        updates.moderation = {
          isFlagged: true,
          flagReason: 'Auto-flagged for suspicious content after edit',
          flaggedAt: new Date(),
          autoFlagged: true,
          flaggedKeywords: contentAnalysis.detectedKeywords
        };
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership or admin/moderator role
    if (post.author.toString() !== req.user._id.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete associated images from R2 storage
    if (post.images && post.images.length > 0) {
      const r2Storage = require('../utils/storage-r2');
      
      for (const image of post.images) {
        if (image.key) {
          try {
            await r2Storage.deleteObject(image.key);
            console.log(`Deleted R2 object: ${image.key}`);
          } catch (error) {
            console.error(`Failed to delete R2 object ${image.key}:`, error);
            // Continue with post deletion even if R2 deletion fails
          }
        }
      }
    }

    await Post.findByIdAndDelete(postId);

    // Update user's post count
    await User.findByIdAndUpdate(post.author, { $inc: { totalPosts: -1 } });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle like on post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot like inactive post'
      });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
      // Log user activity
      await UserActivity.logActivity(req.user._id, 'likes').catch(() => {});
    }

    await post.save();

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likeCount: post.likes.length
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search posts
const searchPosts = async (req, res) => {
  try {
    const {
      q,
      category,
      city,
      priceMin,
      priceMax,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      status: 'active',
      expiresAt: { $gt: new Date() }
    };

    // Enhanced text search
    if (q) {
      // Use enhanced search for better results
      const enhancedQuery = buildEnhancedSearchQuery(q, filters);
      Object.assign(filters, enhancedQuery);
    }

    // Apply other filters
    if (category) filters.category = category;
    if (city) filters['location.city'] = new RegExp(city, 'i');
    if (priceMin || priceMax) {
      filters['price.amount'] = {};
      if (priceMin) filters['price.amount'].$gte = parseFloat(priceMin);
      if (priceMax) filters['price.amount'].$lte = parseFloat(priceMax);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort by text score if text search, otherwise by date
    const sortOptions = q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

    const [posts, totalCount] = await Promise.all([
      Post.find(filters, q ? { score: { $meta: 'textScore' } } : {})
        .populate('author', 'name avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filters)
    ]);

    // Log search activity
    if (req.user) {
      UserActivity.logActivity(req.user._id, 'searches').catch(() => {});
    }

    const postsWithLikes = posts.map(post => ({
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      isLiked: req.user ? post.likes?.includes(req.user._id) : false,
      likes: undefined
    }));

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      posts: postsWithLikes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      searchQuery: q
    });

  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get posts by user
const getUserPosts = async (req, res) => {
  try {
    // Handle both /user/:userId and /my-posts routes
    const userId = req.params.userId || req.user._id;
    const { page = 1, limit = 20, status = 'active' } = req.query;

    // Check if requesting own posts or if admin/moderator
    const canViewAll = req.user._id.toString() === userId || 
                       ['admin', 'moderator'].includes(req.user.role);

    const filters = { author: userId };
    
    if (!canViewAll) {
      filters.status = 'active';
      filters.expiresAt = { $gt: new Date() };
    } else if (status !== 'all') {
      filters.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, totalCount] = await Promise.all([
      Post.find(filters)
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filters)
    ]);

    const postsWithLikes = posts.map(post => ({
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      isLiked: req.user ? post.likes?.includes(req.user._id) : false,
      likes: undefined
    }));

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      posts: postsWithLikes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user posts statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all user posts
    const userPosts = await Post.find({ author: userId });

    // Calculate statistics
    const totalPosts = userPosts.length;
    const activePosts = userPosts.filter(post => post.status === 'active').length;
    const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes ? post.likes.length : 0), 0);

    res.json({
      success: true,
      stats: {
        totalPosts,
        activePosts,
        totalViews,
        totalLikes
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  searchPosts,
  getUserPosts,
  getUserStats
};
