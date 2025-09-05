const jwt = require('jsonwebtoken');
const { auth } = require('../config/firebase');

// 🔐 Verify JWT Token Middleware
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists in Firebase
    try {
      const userRecord = await auth.getUser(decoded.userId);
      
      // Add user info to request object
      req.user = {
        userId: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      };
      
      next();
    } catch (firebaseError) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// 🔧 Optional: Middleware to check if user is admin
const verifyAdmin = async (req, res, next) => {
  try {
    // You can implement admin check here
    // For now, we'll skip this
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin
};