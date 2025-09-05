const axios = require('axios');
const { validationResult } = require('express-validator');

// 📄 SEARCH PDFs
const searchPDFs = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { query, maxResults = 8 } = req.body;
    const userId = req.user.userId;

    console.log(`📄 PDF search requested by user ${userId}: "${query}"`);

    // Validate environment variables
    if (!process.env.CUSTOM_SEARCH_API || !process.env.SEARCH_ENGINE_ID) {
      return res.status(500).json({
        success: false,
        message: 'PDF search service not configured'
      });
    }

    try {
      const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: {
          key: process.env.CUSTOM_SEARCH_API,
          cx: process.env.SEARCH_ENGINE_ID,
          q: `${query} filetype:pdf`, // Ensures only PDFs
          num: Math.min(maxResults, 10), // Google allows max 10 per request
        },
        timeout: 10000 // 10 second timeout
      });

      // Extract and format PDF data
      const pdfs = response.data.items?.map((item, index) => ({
        id: `pdf_${index + 1}`,
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        formattedUrl: item.formattedUrl,
        // Extract file size if available in snippet
        fileSize: extractFileSize(item.snippet),
        // Add relevance score based on position
        relevanceScore: Math.max(10 - index, 1)
      })) || [];

      console.log(`✅ Found ${pdfs.length} PDFs for query: "${query}"`);

      res.status(200).json({
        success: true,
        message: 'PDF search completed successfully',
        data: {
          query,
          results: pdfs,
          totalResults: pdfs.length,
          searchedAt: new Date().toISOString()
        }
      });

    } catch (searchError) {
      console.error('Google Custom Search error:', searchError.response?.data || searchError.message);
      
      // Handle specific Google API errors
      if (searchError.response?.status === 403) {
        return res.status(403).json({
          success: false,
          message: 'PDF search quota exceeded or API key invalid'
        });
      }
      
      if (searchError.response?.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.'
        });
      }

      throw searchError;
    }

  } catch (error) {
    console.error('PDF search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search PDFs'
    });
  }
};

// 🔍 ADVANCED PDF SEARCH with filters
const advancedPDFSearch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      query, 
      subject = '',
      level = '', // beginner, intermediate, advanced
      maxResults = 8,
      excludeSites = [] // sites to exclude from search
    } = req.body;
    
    const userId = req.user.userId;

    console.log(`🔍 Advanced PDF search: "${query}" (${subject}, ${level})`);

    // Build enhanced search query
    let enhancedQuery = query;
    
    if (subject) {
      enhancedQuery += ` ${subject}`;
    }
    
    if (level) {
      const levelTerms = {
        beginner: 'introduction basics fundamentals',
        intermediate: 'intermediate guide tutorial',
        advanced: 'advanced expert comprehensive'
      };
      enhancedQuery += ` ${levelTerms[level] || ''}`;
    }
    
    // Add educational keywords
    enhancedQuery += ' tutorial guide notes study material education';
    
    // Add file type
    enhancedQuery += ' filetype:pdf';
    
    // Add site exclusions
    if (excludeSites.length > 0) {
      excludeSites.forEach(site => {
        enhancedQuery += ` -site:${site}`;
      });
    }

    try {
      const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: {
          key: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
          cx: process.env.GOOGLE_CUSTOM_SEARCH_CX,
          q: enhancedQuery,
          num: Math.min(maxResults, 10),
          safe: 'active', // Enable safe search
        },
        timeout: 15000
      });

      const pdfs = response.data.items?.map((item, index) => ({
        id: `pdf_${Date.now()}_${index}`,
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        formattedUrl: item.formattedUrl,
        fileSize: extractFileSize(item.snippet),
        relevanceScore: calculateRelevanceScore(item, query, subject, level),
        estimatedLevel: estimateContentLevel(item.title + ' ' + item.snippet)
      })) || [];

      // Sort by relevance score
      pdfs.sort((a, b) => b.relevanceScore - a.relevanceScore);

      console.log(`✅ Advanced PDF search found ${pdfs.length} results`);

      res.status(200).json({
        success: true,
        message: 'Advanced PDF search completed',
        data: {
          originalQuery: query,
          enhancedQuery,
          filters: { subject, level, excludeSites },
          results: pdfs,
          totalResults: pdfs.length,
          searchedAt: new Date().toISOString()
        }
      });

    } catch (searchError) {
      throw searchError;
    }

  } catch (error) {
    console.error('Advanced PDF search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform advanced PDF search'
    });
  }
};

// 🔧 Helper function to extract file size from snippet
const extractFileSize = (snippet) => {
  const sizeMatch = snippet?.match(/(\d+(?:\.\d+)?)\s?(KB|MB|GB)/i);
  return sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2].toUpperCase()}` : null;
};

// 🔧 Helper function to calculate relevance score
const calculateRelevanceScore = (item, query, subject, level) => {
  let score = 5; // Base score
  
  const title = (item.title || '').toLowerCase();
  const snippet = (item.snippet || '').toLowerCase();
  const queryLower = query.toLowerCase();
  const subjectLower = (subject || '').toLowerCase();
  
  // Query match in title (high weight)
  if (title.includes(queryLower)) score += 3;
  
  // Query match in snippet
  if (snippet.includes(queryLower)) score += 2;
  
  // Subject match
  if (subject && (title.includes(subjectLower) || snippet.includes(subjectLower))) {
    score += 2;
  }
  
  // Educational keywords boost
  const eduKeywords = ['tutorial', 'guide', 'notes', 'study', 'course', 'lecture'];
  eduKeywords.forEach(keyword => {
    if (title.includes(keyword) || snippet.includes(keyword)) {
      score += 1;
    }
  });
  
  // Level appropriateness
  if (level) {
    const levelKeywords = {
      beginner: ['introduction', 'basics', 'fundamentals', 'beginner'],
      intermediate: ['intermediate', 'guide', 'tutorial'],
      advanced: ['advanced', 'expert', 'comprehensive', 'detailed']
    };
    
    const keywords = levelKeywords[level] || [];
    keywords.forEach(keyword => {
      if (title.includes(keyword) || snippet.includes(keyword)) {
        score += 1;
      }
    });
  }
  
  return Math.min(score, 10); // Cap at 10
};

// 🔧 Helper function to estimate content level
const estimateContentLevel = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('advanced') || lowerText.includes('expert') || 
      lowerText.includes('comprehensive') || lowerText.includes('detailed')) {
    return 'advanced';
  }
  
  if (lowerText.includes('intermediate') || lowerText.includes('guide') || 
      lowerText.includes('tutorial')) {
    return 'intermediate';
  }
  
  if (lowerText.includes('introduction') || lowerText.includes('basics') || 
      lowerText.includes('fundamentals') || lowerText.includes('beginner')) {
    return 'beginner';
  }
  
  return 'general';
};

module.exports = {
  searchPDFs,
  advancedPDFSearch
};