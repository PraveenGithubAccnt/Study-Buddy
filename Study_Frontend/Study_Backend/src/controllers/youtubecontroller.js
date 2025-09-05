const axios = require('axios');
const { validationResult } = require('express-validator');

// 🎥 SEARCH YOUTUBE VIDEOS
const searchYouTubeVideos = async (req, res) => {
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

    const { query, maxResults = 8, order = 'relevance' } = req.body;
    const userId = req.user.userId;

    console.log(`🎥 YouTube search requested by user ${userId}: "${query}"`);

    // Validate environment variables
    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'YouTube API not configured'
      });
    }

    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          maxResults: Math.min(maxResults, 25), // YouTube allows max 25
          q: `${query} explained tutorial`,
          type: "video",
          order: order, // relevance, date, rating, viewCount, title
          key: process.env.YOUTUBE_API_KEY,
          videoDuration: 'medium', // Prefer medium-length videos for education
          videoDefinition: 'any',
          safeSearch: 'strict'
        },
        timeout: 10000
      });

      // Format video data
      const videos = response.data.items?.map((item, index) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: {
          default: item.snippet.thumbnails.default?.url,
          medium: item.snippet.thumbnails.medium?.url,
          high: item.snippet.thumbnails.high?.url
        },
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        relevanceScore: Math.max(10 - index, 1), // Simple relevance based on order
        publishTime: formatPublishTime(item.snippet.publishedAt)
      })) || [];

      console.log(`✅ Found ${videos.length} YouTube videos for: "${query}"`);

      res.status(200).json({
        success: true,
        message: 'YouTube search completed successfully',
        data: {
          query,
          results: videos,
          totalResults: videos.length,
          searchedAt: new Date().toISOString()
        }
      });

    } catch (searchError) {
      console.error('YouTube API error:', searchError.response?.data || searchError.message);
      
      // Handle specific YouTube API errors
      if (searchError.response?.status === 403) {
        return res.status(403).json({
          success: false,
          message: 'YouTube API quota exceeded or key invalid'
        });
      }
      
      if (searchError.response?.status === 400) {
        return res.status(400).json({
          success: false,
          message: 'Invalid search query for YouTube'
        });
      }

      throw searchError;
    }

  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search YouTube videos'
    });
  }
};

// 🎬 ADVANCED YOUTUBE SEARCH with educational filters
const advancedYouTubeSearch = async (req, res) => {
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
      level = '',
      duration = 'medium', // short, medium, long
      maxResults = 8,
      order = 'relevance',
      channelType = 'any' // any, educational
    } = req.body;
    
    const userId = req.user.userId;

    console.log(`🎬 Advanced YouTube search: "${query}" (${subject}, ${level})`);

    // Build enhanced search query
    let enhancedQuery = query;
    
    if (subject) {
      enhancedQuery += ` ${subject}`;
    }
    
    if (level) {
      const levelTerms = {
        beginner: 'beginner introduction basics explained simply',
        intermediate: 'intermediate tutorial guide',
        advanced: 'advanced expert detailed comprehensive'
      };
      enhancedQuery += ` ${levelTerms[level] || ''}`;
    }
    
    // Add educational keywords
    enhancedQuery += ' tutorial explained lesson course lecture';

    // Educational channels filter
    const educationalChannels = [
      'Khan Academy', 'Crash Course', '3Blue1Brown', 'TED-Ed', 
      'MIT OpenCourseWare', 'Stanford', 'Harvard'
    ];

    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          maxResults: Math.min(maxResults * 2, 25), // Get more to filter later
          q: enhancedQuery,
          type: "video",
          order: order,
          key: process.env.YOUTUBE_API_KEY,
          videoDuration: duration,
          videoDefinition: 'any',
          safeSearch: 'strict',
          relevanceLanguage: 'en'
        },
        timeout: 15000
      });

      let videos = response.data.items?.map((item, index) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: {
          default: item.snippet.thumbnails.default?.url,
          medium: item.snippet.thumbnails.medium?.url,
          high: item.snippet.thumbnails.high?.url
        },
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        relevanceScore: calculateVideoRelevanceScore(item, query, subject, level),
        publishTime: formatPublishTime(item.snippet.publishedAt),
        isEducational: educationalChannels.some(channel => 
          item.snippet.channelTitle.toLowerCase().includes(channel.toLowerCase())
        ),
        estimatedLevel: estimateVideoLevel(item.snippet.title + ' ' + item.snippet.description)
      })) || [];

      // Filter educational channels if requested
      if (channelType === 'educational') {
        videos = videos.filter(video => video.isEducational);
      }

      // Sort by relevance score and limit results
      videos.sort((a, b) => b.relevanceScore - a.relevanceScore);
      videos = videos.slice(0, maxResults);

      console.log(`✅ Advanced YouTube search found ${videos.length} results`);

      res.status(200).json({
        success: true,
        message: 'Advanced YouTube search completed',
        data: {
          originalQuery: query,
          enhancedQuery,
          filters: { subject, level, duration, channelType },
          results: videos,
          totalResults: videos.length,
          searchedAt: new Date().toISOString()
        }
      });

    } catch (searchError) {
      console.error('Advanced YouTube API error:', searchError.response?.data || searchError.message);
      throw searchError;
    }

  } catch (error) {
    console.error('Advanced YouTube search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform advanced YouTube search'
    });
  }
};

// 📊 GET VIDEO DETAILS (for selected videos)
const getVideoDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { videoIds } = req.body; // Array of video IDs
    const userId = req.user.userId;

    console.log(`📊 Video details requested for ${videoIds.length} videos`);

    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          part: "snippet,contentDetails,statistics",
          id: videoIds.join(','),
          key: process.env.YOUTUBE_API_KEY
        },
        timeout: 10000
      });

      const videoDetails = response.data.items?.map(item => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: parseDuration(item.contentDetails.duration),
        viewCount: parseInt(item.statistics.viewCount || 0),
        likeCount: parseInt(item.statistics.likeCount || 0),
        commentCount: parseInt(item.statistics.commentCount || 0),
        thumbnail: item.snippet.thumbnails.high?.url,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        tags: item.snippet.tags || []
      })) || [];

      res.status(200).json({
        success: true,
        message: 'Video details retrieved successfully',
        data: {
          videos: videoDetails,
          count: videoDetails.length
        }
      });

    } catch (detailsError) {
      console.error('YouTube video details error:', detailsError.response?.data || detailsError.message);
      throw detailsError;
    }

  } catch (error) {
    console.error('Get video details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get video details'
    });
  }
};

// 🔧 Helper function to format publish time
const formatPublishTime = (publishedAt) => {
  const now = new Date();
  const published = new Date(publishedAt);
  const diffMs = now - published;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return 'Today';
};

// 🔧 Helper function to calculate video relevance score
const calculateVideoRelevanceScore = (item, query, subject, level) => {
  let score = 5; // Base score
  
  const title = (item.snippet.title || '').toLowerCase();
  const description = (item.snippet.description || '').toLowerCase();
  const channel = (item.snippet.channelTitle || '').toLowerCase();
  const queryLower = query.toLowerCase();
  const subjectLower = (subject || '').toLowerCase();
  
  // Query match in title (highest weight)
  if (title.includes(queryLower)) score += 4;
  
  // Query match in description
  if (description.includes(queryLower)) score += 2;
  
  // Subject match
  if (subject && (title.includes(subjectLower) || description.includes(subjectLower))) {
    score += 3;
  }

  // Level keywords in title/description
  if (level) {
    const levelTerms = {
      beginner: ['beginner', 'introduction', 'basics', 'explained simply'],
      intermediate: ['intermediate', 'tutorial', 'guide'],
      advanced: ['advanced', 'expert', 'detailed', 'comprehensive']
    };
    const terms = levelTerms[level] || [];
    terms.forEach(term => {
      if (title.includes(term) || description.includes(term)) {
        score += 1;
      }
    });
  }

  // Educational channel bonus
  const educationalChannels = [
    'khan academy', 'crash course', '3blue1brown', 'ted-ed',
    'mit opencourseware', 'stanford', 'harvard'
  ];
  if (educationalChannels.some(edu => channel.includes(edu))) {
    score += 2;
  }

  return score;
};

// 🔧 Helper to parse ISO 8601 YouTube video duration
const parseDuration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return (hours * 3600) + (minutes * 60) + seconds; // return in seconds
};

// 🔧 Helper to estimate video level
const estimateVideoLevel = (text) => {
  const lower = text.toLowerCase();
  if (/(beginner|intro|basics|for dummies|getting started)/.test(lower)) return 'beginner';
  if (/(intermediate|standard|tutorial|guide)/.test(lower)) return 'intermediate';
  if (/(advanced|expert|comprehensive|detailed|masterclass)/.test(lower)) return 'advanced';
  return 'unspecified';
};

module.exports = {
  searchYouTubeVideos,
  advancedYouTubeSearch,
  getVideoDetails
};
