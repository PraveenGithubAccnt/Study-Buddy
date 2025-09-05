const express = require('express');
const {
  searchYouTubeVideos,
  advancedYouTubeSearch,
  getVideoDetails
} = require('../controllers/youtubecontroller');
const { verifyToken } = require('../middleware/authmiddleware');

const router = express.Router();

// 🎥 Basic YouTube Search
router.post('/search', verifyToken,searchYouTubeVideos);

// 🎬 Advanced YouTube Search
router.post('/advanced', verifyToken, advancedYouTubeSearch);

// 📊 Get Video Details
router.post('/details', verifyToken, getVideoDetails);

module.exports = router;
