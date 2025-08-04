// Content moderation and keyword detection utilities

// Predefined lists of flagged keywords
const FLAGGED_KEYWORDS = {
  spam: [
    'spam', 'scam', 'fraud', 'fake', 'phishing', 'click here', 'act now', 
    'limited time', 'urgent', 'cash now', 'free money', 'get rich quick',
    'work from home', 'make money fast', 'no experience necessary'
  ],
  inappropriate: [
    'hate', 'racist', 'discrimination', 'violence', 'threat', 'kill',
    'bomb', 'weapon', 'drug', 'illegal', 'stolen', 'counterfeit'
  ],
  adult: [
    'adult', 'porn', 'xxx', 'sex', 'escort', 'massage', 'dating',
    'hookup', 'sexy', 'nude', 'webcam'
  ],
  harassment: [
    'harass', 'bully', 'stalker', 'creep', 'pervert', 'loser',
    'stupid', 'idiot', 'kill yourself', 'die'
  ],
  financial: [
    'bitcoin', 'cryptocurrency', 'investment', 'loan', 'credit card',
    'bank account', 'social security', 'ssn', 'tax refund', 'irs'
  ]
};

// Severity levels for different types of content
const SEVERITY_LEVELS = {
  low: ['spam', 'inappropriate'],
  medium: ['adult', 'financial'],
  high: ['harassment'],
  critical: ['violence', 'threats', 'illegal']
};

/**
 * Detect flagged keywords in text content
 * @param {string} text - Text content to analyze
 * @param {Array} customKeywords - Additional keywords to check
 * @returns {Object} Analysis result with detected keywords and severity
 */
const detectFlaggedContent = (text, customKeywords = []) => {
  if (!text || typeof text !== 'string') {
    return {
      isFlagged: false,
      severity: 'none',
      detectedKeywords: [],
      categories: [],
      confidence: 0
    };
  }

  const content = text.toLowerCase().trim();
  const detectedKeywords = [];
  const categories = [];
  let maxSeverity = 'none';
  let severityScore = 0;

  // Check against predefined keyword lists
  for (const [category, keywords] of Object.entries(FLAGGED_KEYWORDS)) {
    const foundKeywords = keywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      detectedKeywords.push(...foundKeywords);
      categories.push(category);

      // Determine severity
      const categorySeverity = getSeverityForCategory(category);
      const categoryScore = getSeverityScore(categorySeverity);
      
      if (categoryScore > severityScore) {
        severityScore = categoryScore;
        maxSeverity = categorySeverity;
      }
    }
  }

  // Check custom keywords
  if (customKeywords.length > 0) {
    const foundCustomKeywords = customKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    if (foundCustomKeywords.length > 0) {
      detectedKeywords.push(...foundCustomKeywords);
      categories.push('custom');
      
      if (severityScore < 2) { // Treat custom keywords as medium severity
        severityScore = 2;
        maxSeverity = 'medium';
      }
    }
  }

  // Calculate confidence score based on number and type of matches
  const confidence = calculateConfidence(detectedKeywords, categories, content);

  return {
    isFlagged: detectedKeywords.length > 0,
    severity: maxSeverity,
    detectedKeywords: [...new Set(detectedKeywords)], // Remove duplicates
    categories: [...new Set(categories)],
    confidence: confidence
  };
};

/**
 * Get severity level for a keyword category
 * @param {string} category - Keyword category
 * @returns {string} Severity level
 */
const getSeverityForCategory = (category) => {
  for (const [severity, categories] of Object.entries(SEVERITY_LEVELS)) {
    if (categories.includes(category)) {
      return severity;
    }
  }
  return 'low';
};

/**
 * Get numeric score for severity level
 * @param {string} severity - Severity level
 * @returns {number} Numeric score
 */
const getSeverityScore = (severity) => {
  const scores = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
  return scores[severity] || 0;
};

/**
 * Calculate confidence score for flagged content
 * @param {Array} keywords - Detected keywords
 * @param {Array} categories - Detected categories
 * @param {string} content - Original content
 * @returns {number} Confidence score (0-1)
 */
const calculateConfidence = (keywords, categories, content) => {
  if (keywords.length === 0) return 0;

  let confidence = 0;

  // Base confidence from number of keywords
  confidence += Math.min(keywords.length * 0.2, 0.6);

  // Bonus for multiple categories
  confidence += Math.min(categories.length * 0.1, 0.2);

  // Bonus for high-severity categories
  if (categories.includes('harassment') || categories.includes('violence')) {
    confidence += 0.2;
  }

  // Penalty for very long content (might be false positive)
  if (content.length > 1000) {
    confidence *= 0.8;
  }

  return Math.min(confidence, 1);
};

/**
 * Check if content should be auto-flagged based on severity and confidence
 * @param {Object} analysis - Result from detectFlaggedContent
 * @returns {boolean} Whether content should be auto-flagged
 */
const shouldAutoFlag = (analysis) => {
  if (!analysis.isFlagged) return false;

  // Auto-flag critical content regardless of confidence
  if (analysis.severity === 'critical') return true;

  // Auto-flag high severity with medium+ confidence
  if (analysis.severity === 'high' && analysis.confidence >= 0.5) return true;

  // Auto-flag medium severity with high confidence
  if (analysis.severity === 'medium' && analysis.confidence >= 0.7) return true;

  // Auto-flag low severity with very high confidence
  if (analysis.severity === 'low' && analysis.confidence >= 0.9) return true;

  return false;
};

/**
 * Generate a human-readable report for flagged content
 * @param {Object} analysis - Result from detectFlaggedContent
 * @returns {string} Human-readable report
 */
const generateModerationReport = (analysis) => {
  if (!analysis.isFlagged) {
    return 'Content passed moderation checks.';
  }

  const { severity, categories, detectedKeywords, confidence } = analysis;
  
  let report = `Content flagged with ${severity} severity (${Math.round(confidence * 100)}% confidence).\n`;
  report += `Categories: ${categories.join(', ')}\n`;
  report += `Detected keywords: ${detectedKeywords.join(', ')}\n`;
  
  if (shouldAutoFlag(analysis)) {
    report += 'RECOMMENDATION: Auto-flag for review.';
  } else {
    report += 'RECOMMENDATION: Manual review suggested.';
  }

  return report;
};

/**
 * Sanitize content by removing or replacing flagged keywords
 * @param {string} text - Original text
 * @param {Object} analysis - Moderation analysis result
 * @returns {string} Sanitized text
 */
const sanitizeContent = (text, analysis) => {
  if (!analysis.isFlagged) return text;

  let sanitized = text;
  
  // Replace flagged keywords with asterisks
  analysis.detectedKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const replacement = '*'.repeat(keyword.length);
    sanitized = sanitized.replace(regex, replacement);
  });

  return sanitized;
};

/**
 * Add custom keywords to the flagged keywords list
 * @param {string} category - Category for the keywords
 * @param {Array} keywords - Array of keywords to add
 */
const addCustomKeywords = (category, keywords) => {
  if (!FLAGGED_KEYWORDS[category]) {
    FLAGGED_KEYWORDS[category] = [];
  }
  
  keywords.forEach(keyword => {
    if (!FLAGGED_KEYWORDS[category].includes(keyword.toLowerCase())) {
      FLAGGED_KEYWORDS[category].push(keyword.toLowerCase());
    }
  });
};

/**
 * Get all flagged keywords for a category
 * @param {string} category - Category name
 * @returns {Array} Array of keywords
 */
const getKeywordsByCategory = (category) => {
  return FLAGGED_KEYWORDS[category] || [];
};

module.exports = {
  detectFlaggedContent,
  shouldAutoFlag,
  generateModerationReport,
  sanitizeContent,
  addCustomKeywords,
  getKeywordsByCategory,
  FLAGGED_KEYWORDS,
  SEVERITY_LEVELS
};
