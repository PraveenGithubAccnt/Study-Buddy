const express = require('express');
const { searchPDFs, advancedPDFSearch } = require('../controllers/pdfcontroller');
const { verifyToken } = require('../middleware/authmiddleware');

const router = express.Router();

// 📄 Basic PDF Search
router.post('/search', verifyToken, searchPDFs);

// 🔍 Advanced PDF Search
router.post('/advanced' , verifyToken, advancedPDFSearch);

module.exports = router;
