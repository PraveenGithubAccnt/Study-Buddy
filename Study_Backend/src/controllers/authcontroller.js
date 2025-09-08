const { auth, firestore } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// 🔧 Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 🔧 Helper function to get friendly error messages
const getFriendlyErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Wrong password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

// 📝 REGISTER USER
const registerUser = async (req, res) => {
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

    const { fullname, email, password, profilePhotoURL } = req.body;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: fullname,
    });

    // Save additional user info to Firestore
    await firestore.collection('users').doc(userRecord.uid).set({
      fullname,
      email,
      profilePhotoURL: profilePhotoURL || 'https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png',
      createdAt: new Date().toISOString(),
      uid: userRecord.uid
    });

    // Generate JWT token
    const token = generateToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          fullname,
          profilePhotoURL: profilePhotoURL || 'https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png'
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    const friendlyMessage = getFriendlyErrorMessage(error.code);
    
    res.status(400).json({
      success: false,
      message: friendlyMessage,
      error: error.code || 'registration-failed'
    });
  }
};

// 🔐 LOGIN USER (Pure Backend)
const loginUser = async (req, res) => {
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

    const { email, password } = req.body;

    // Use Firebase REST API to verify email/password
    const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY;
    
    if (!firebaseApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Firebase configuration error'
      });
    }

    // Verify credentials using Firebase REST API
    const loginResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      // Handle Firebase authentication errors
      let errorMessage = 'Login failed';
      
      if (loginData.error) {
        switch (loginData.error.message) {
          case 'EMAIL_NOT_FOUND':
            errorMessage = 'No account found with this email';
            break;
          case 'INVALID_PASSWORD':
            errorMessage = 'Incorrect password';
            break;
          case 'USER_DISABLED':
            errorMessage = 'This account has been disabled';
            break;
          case 'INVALID_EMAIL':
            errorMessage = 'Invalid email address';
            break;
          case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          default:
            errorMessage = 'Login failed. Please try again';
        }
      }

      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    // Get user ID from login response
    const userId = loginData.localId;

    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const userData = userDoc.data();

    // Generate JWT token
    const token = generateToken(userId);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          uid: userId,
          email: email,
          fullname: userData.fullname,
          profilePhotoURL: userData.profilePhotoURL
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again',
      error: 'login-failed'
    });
  }
};

// 👤 GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    // Get user from Firestore
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

// 🔓 LOGOUT USER (Optional - mainly clears token on client side)
const logoutUser = async (req, res) => {
  try {
    // In JWT-based auth, logout is mainly handled on client side
    // by removing the token from storage
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// 🔄 UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const { profilePhotoURL, fullname } = req.body;

    if (!profilePhotoURL && !fullname) {
      return res.status(400).json({
        success: false,
        message: 'No data provided to update'
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (profilePhotoURL) updateData.profilePhotoURL = profilePhotoURL;
    if (fullname) updateData.fullname = fullname;

    // Update in Firestore
    await firestore.collection('users').doc(userId).update(updateData);

    // Get updated user data
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};
//Forgot Password Controller

const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Use Firebase REST API to send reset email
    const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY;
    
    if (!firebaseApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Firebase configuration error'
      });
    }

    const resetResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: email,
        }),
      }
    );

    const resetData = await resetResponse.json();
    console.log('Firebase reset response:', resetData);

    if (!resetResponse.ok) {
      let errorMessage = 'Failed to send reset email';
      
      if (resetData.error) {
        switch (resetData.error.message) {
          case 'EMAIL_NOT_FOUND':
            errorMessage = 'No account found with this email address';
            break;
          case 'INVALID_EMAIL':
            errorMessage = 'Invalid email address';
            break;
          case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          default:
            errorMessage = resetData.error.message;
        }
      }

      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    console.log(`Password reset email sent to: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email. Please try again.'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  forgotPassword 
};