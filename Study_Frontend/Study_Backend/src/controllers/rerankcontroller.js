const { validationResult } = require('express-validator');

// 🔄 RERANK SEARCH RESULTS
const rerankSearchResults = async (req, res) => {
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

    const { 
      query, 
      pdfResults = [], 
      videoResults = [], 
      maxResults = 5,
      subject = '',
      level = ''
    } = req.body;
    
    const userId = req.user.userId;

    console.log(`🔄 Reranking results for user ${userId}: "${query}"`);

    // Combine and score all results
    const allResults = [];
    
    // Process PDF results
    pdfResults.forEach((pdf, index) => {
      const relevanceScore = calculateContentRelevance(
        pdf.title + ' ' + pdf.snippet, 
        query, 
        subject, 
        level, 
        'pdf'
      );
      
      allResults.push({
        ...pdf,
        type: 'pdf',
        originalRank: index + 1,
        rerankScore: relevanceScore,
        source: 'pdf_search'
      });
    });

    // Process Video results
    videoResults.forEach((video, index) => {
      const relevanceScore = calculateContentRelevance(
        video.title + ' ' + (video.description || ''), 
        query, 
        subject, 
        level, 
        'video'
      );
      
      allResults.push({
        ...video,
        type: 'video',
        originalRank: index + 1,
        rerankScore: relevanceScore,
        source: 'youtube_search'
      });
    });

    // Advanced reranking algorithm
    const rerankedResults = performAdvancedReranking(
      allResults, 
      query, 
      subject, 
      level, 
      maxResults
    );

    // Separate results by type for response
    const topPDFs = rerankedResults
      .filter(item => item.type === 'pdf')
      .slice(0, Math.ceil(maxResults / 2));
    
    const topVideos = rerankedResults
      .filter(item => item.type === 'video')
      .slice(0, Math.ceil(maxResults / 2));

    console.log(`✅ Reranked ${allResults.length} items, returning top ${rerankedResults.length}`);

    res.status(200).json({
      success: true,
      message: 'Results reranked successfully',
      data: {
        query,
        filters: { subject, level },
        originalCount: {
          pdfs: pdfResults.length,
          videos: videoResults.length,
          total: allResults.length
        },
        rerankedResults: rerankedResults.slice(0, maxResults),
        topPDFs,
        topVideos,
        rerankingMetrics: {
          algorithmUsed: 'content_relevance_scoring',
          processingTime: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Rerank search results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rerank search results'
    });
  }
};

// 🎯 SMART CONTENT RECOMMENDATION
const getSmartRecommendations = async (req, res) => {
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
      userPreferences = {},
      learningHistory = [],
      contentTypes = ['pdf', 'video'],
      maxRecommendations = 8
    } = req.body;
    
    const userId = req.user.userId;

    console.log(`🎯 Smart recommendations for: "${query}"`);

    // Analyze user preferences and history
    const userProfile = analyzeUserProfile(userPreferences, learningHistory);
    
    // Generate content recommendations based on query and user profile
    const recommendations = generateSmartRecommendations(
      query, 
      userProfile, 
      contentTypes, 
      maxRecommendations
    );

    res.status(200).json({
      success: true,
      message: 'Smart recommendations generated',
      data: {
        query,
        userProfile,
        recommendations,
        totalRecommendations: recommendations.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Smart recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart recommendations'
    });
  }
};

// 📊 CONTENT QUALITY ANALYSIS
const analyzeContentQuality = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { contentItems } = req.body; // Array of content items to analyze
    const userId = req.user.userId;

    console.log(`📊 Analyzing quality of ${contentItems.length} content items`);

    const qualityAnalysis = contentItems.map(item => {
      const qualityScore = calculateContentQuality(item);
      const educationalValue = assessEducationalValue(item);
      const credibilityScore = assessCredibility(item);
      
      return {
        ...item,
        qualityMetrics: {
          overallScore: Math.round((qualityScore + educationalValue + credibilityScore) / 3),
          qualityScore,
          educationalValue,
          credibilityScore,
          recommendation: getQualityRecommendation(qualityScore, educationalValue, credibilityScore)
        }
      };
    });

    // Sort by overall quality score
    qualityAnalysis.sort((a, b) => b.qualityMetrics.overallScore - a.qualityMetrics.overallScore);

    res.status(200).json({
      success: true,
      message: 'Content quality analysis completed',
      data: {
        analysisResults: qualityAnalysis,
        summary: {
          totalItems: contentItems.length,
          highQuality: qualityAnalysis.filter(item => item.qualityMetrics.overallScore >= 8).length,
          mediumQuality: qualityAnalysis.filter(item => item.qualityMetrics.overallScore >= 6 && item.qualityMetrics.overallScore < 8).length,
          lowQuality: qualityAnalysis.filter(item => item.qualityMetrics.overallScore < 6).length
        }
      }
    });

  } catch (error) {
    console.error('Content quality analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content quality'
    });
  }
};

// 🔧 Helper function to calculate content relevance
const calculateContentRelevance = (content, query, subject, level, type) => {
  let score = 0;
  const contentLower = content.toLowerCase();
  const queryLower = query.toLowerCase();
  const subjectLower = (subject || '').toLowerCase();
  
  // Query match scoring
  const queryWords = queryLower.split(' ');
  queryWords.forEach(word => {
    if (word.length > 2 && contentLower.includes(word)) {
      score += 2;
    }
  });
  
  // Exact query match bonus
  if (contentLower.includes(queryLower)) {
    score += 5;
  }
  
  // Subject relevance
  if (subject && contentLower.includes(subjectLower)) {
    score += 3;
  }
  
  // Level appropriateness
  if (level) {
    const levelKeywords = {
      beginner: ['beginner', 'introduction', 'basics', 'simple', 'easy', 'fundamentals'],
      intermediate: ['intermediate', 'tutorial', 'guide', 'step by step'],
      advanced: ['advanced', 'expert', 'detailed', 'comprehensive', 'in-depth']
    };
    
    const keywords = levelKeywords[level] || [];
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 2;
      }
    });
  }
  
  // Content type specific bonuses
  if (type === 'pdf') {
    const pdfKeywords = ['notes', 'textbook', 'manual', 'guide', 'reference'];
    pdfKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) score += 1;
    });
  } else if (type === 'video') {
    const videoKeywords = ['tutorial', 'explained', 'demonstration', 'lecture'];
    videoKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) score += 1;
    });
  }
  
  return Math.min(score, 20); // Cap at 20
};

// 🔧 Advanced reranking algorithm
const performAdvancedReranking = (results, query, subject, level, maxResults) => {
  // Apply multiple ranking factors
  results.forEach(item => {
    let finalScore = item.rerankScore;
    
    // Diversity bonus (prefer mix of content types)
    const typeCount = results.filter(r => r.type === item.type).length;
    if (typeCount < results.length * 0.7) { // If less than 70% are same type
      finalScore += 1;
    }
    
    // Recency bonus for videos (educational content should be relatively recent)
    if (item.type === 'video' && item.publishedAt) {
      const publishDate = new Date(item.publishedAt);
      const daysSincePublish = (new Date() - publishDate) / (1000 * 60 * 60 * 24);
      if (daysSincePublish < 365) { // Less than 1 year old
        finalScore += Math.max(2 - daysSincePublish / 365, 0);
      }
    }
    
    // Educational channel/source bonus
    if (item.type === 'video' && item.isEducational) {
      finalScore += 3;
    }
    
    if (item.type === 'pdf' && item.displayLink) {
      const educationalDomains = ['edu', 'ac.', 'mit.edu', 'stanford.edu', 'harvard.edu'];
      if (educationalDomains.some(domain => item.displayLink.includes(domain))) {
        finalScore += 3;
      }
    }
    
    item.finalScore = finalScore;
  });
  
  // Sort by final score and return top results
  return results
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, maxResults);
};

// 🔧 Analyze user profile
const analyzeUserProfile = (preferences, history) => {
  const profile = {
    preferredContentTypes: preferences.contentTypes || ['pdf', 'video'],
    learningLevel: preferences.level || 'intermediate',
    subjects: preferences.subjects || [],
    engagement: {
      totalSessions: history.length,
      avgSessionLength: 0,
      preferredDifficulty: 'intermediate'
    }
  };
  
  // Analyze learning history if provided
  if (history.length > 0) {
    const subjects = history.map(h => h.subject).filter(Boolean);
    profile.frequentSubjects = [...new Set(subjects)];
    
    const levels = history.map(h => h.level).filter(Boolean);
    const levelCounts = levels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    // Determine preferred difficulty
    const maxLevel = Object.keys(levelCounts).reduce((a, b) => 
      levelCounts[a] > levelCounts[b] ? a : b, 'intermediate'
    );
    profile.engagement.preferredDifficulty = maxLevel;
  }
  
  return profile;
};

// 🔧 Generate smart recommendations
const generateSmartRecommendations = (query, userProfile, contentTypes, maxRecommendations) => {
  // This would typically involve ML algorithms or external APIs
  // For now, we'll use rule-based recommendations
  
  const recommendations = [];
  
  // Content type distribution based on user preferences
  const pdfCount = contentTypes.includes('pdf') ? Math.ceil(maxRecommendations * 0.4) : 0;
  const videoCount = contentTypes.includes('video') ? Math.ceil(maxRecommendations * 0.6) : 0;
  
  // Generate PDF recommendations
  for (let i = 0; i < pdfCount; i++) {
    recommendations.push({
      type: 'pdf',
      title: `${query} - Study Guide ${i + 1}`,
      reason: 'Based on your preference for detailed study materials',
      confidence: 0.8,
      estimatedReadTime: '15-30 minutes'
    });
  }
  
  // Generate Video recommendations
  for (let i = 0; i < videoCount; i++) {
    recommendations.push({
      type: 'video',
      title: `${query} Tutorial ${i + 1}`,
      reason: 'Recommended based on your visual learning preference',
      confidence: 0.85,
      estimatedWatchTime: '10-20 minutes'
    });
  }
  
  return recommendations;
};

// 🔧 Calculate content quality score
const calculateContentQuality = (item) => {
  let score = 5; // Base score
  
  const title = (item.title || '').toLowerCase();
  const content = (item.snippet || item.description || '').toLowerCase();
  
  // Title quality indicators
  if (title.length > 10 && title.length < 100) score += 1;
  if (!title.includes('click') && !title.includes('amazing')) score += 1; // Avoid clickbait
  
  // Content depth indicators
  if (content.length > 100) score += 1;
  if (content.includes('comprehensive') || content.includes('detailed')) score += 1;
  
  // Educational indicators
  const eduIndicators = ['tutorial', 'guide', 'explanation', 'course', 'lesson'];
  if (eduIndicators.some(indicator => title.includes(indicator) || content.includes(indicator))) {
    score += 2;
  }
  
  return Math.min(score, 10);
};

// 🔧 Assess educational value
const assessEducationalValue = (item) => {
  let score = 5;
  
  const title = (item.title || '').toLowerCase();
  const content = (item.snippet || item.description || '').toLowerCase();
  
  // Educational keywords
  const eduKeywords = ['learn', 'understand', 'explain', 'teach', 'study', 'concept'];
  eduKeywords.forEach(keyword => {
    if (title.includes(keyword) || content.includes(keyword)) score += 0.5;
  });
  
  // Structure indicators
  if (content.includes('step') || content.includes('chapter') || content.includes('section')) {
    score += 1;
  }
  
  return Math.min(score, 10);
};

// 🔧 Assess credibility
const assessCredibility = (item) => {
  let score = 5;
  
  // Source credibility for PDFs
  if (item.type === 'pdf' && item.displayLink) {
    const credibleDomains = ['edu', 'gov', 'ac.', 'org'];
    if (credibleDomains.some(domain => item.displayLink.includes(domain))) {
      score += 3;
    }
  }
  
  // Channel credibility for videos
  if (item.type === 'video' && item.channelTitle) {
    const credibleChannels = ['khan academy', 'crash course', 'ted', 'mit', 'stanford'];
    if (credibleChannels.some(channel => item.channelTitle.toLowerCase().includes(channel))) {
      score += 3;
    }
  }
  
  return Math.min(score, 10);
};

// 🔧 Get quality recommendation
const getQualityRecommendation = (quality, educational, credibility) => {
  const avgScore = (quality + educational + credibility) / 3;
  
  if (avgScore >= 8) return 'highly_recommended';
  if (avgScore >= 6) return 'recommended';
  if (avgScore >= 4) return 'use_with_caution';
  return 'not_recommended';
};

module.exports = {
  rerankSearchResults,
  getSmartRecommendations,
  analyzeContentQuality
};