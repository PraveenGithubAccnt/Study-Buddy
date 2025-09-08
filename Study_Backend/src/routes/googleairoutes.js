const express = require('express');
const {
  getAIExplanation,
  aiChat,
  generateStudyNotes,
  generateQuizQuestions
} = require("../controllers/googleaicontroller.js");

const { verifyToken } = require('../middleware/authmiddleware');

const router = express.Router();

// Protect routes with the verifyToken middleware
router.post("/explain", verifyToken, getAIExplanation);
router.post("/chat", verifyToken, aiChat);
router.post("/notes", verifyToken, generateStudyNotes);
router.post('/quiz', verifyToken, generateQuizQuestions);


module.exports = router;
