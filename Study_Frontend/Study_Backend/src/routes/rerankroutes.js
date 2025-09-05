const express = require('express');
const {
  rerankSearchResults,
  getSmartRecommendations,
  analyzeContentQuality
} = require('../controllers/rerankcontroller');

const { verifyToken } = require('../middleware/authmiddleware');

const router = express.Router();

// 🔄 Rerank Search Results
router.post('/rerank', verifyToken, rerankSearchResults);

// 🎯 Smart Recommendations
router.post('/recommend', verifyToken, getSmartRecommendations);

// 📊 Content Quality Analysis
router.post('/analyze', verifyToken, analyzeContentQuality);

module.exports = router;
