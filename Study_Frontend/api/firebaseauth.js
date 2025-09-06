import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://study-buddy-production-69c4.up.railway.app/api/auth'; 


// 🔧 Enhanced Generic API call with detailed logging
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await AsyncStorage.getItem('userToken');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    console.log(`🌐 API Call: ${config.method || "GET"} ${url}`);
    console.log('📋 Request config:', {
      headers: config.headers,
      body: config.body,
      method: config.method || "GET"
    });

    const response = await fetch(url, config);
    
    // Debug: Log response details
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    const data = await response.json();
    console.log('📥 Response data:', data);

    if (!response.ok || !data.success) {
      console.error('❌ API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(data.message || `API call failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error('❌ API Call Error:', {
      message: err.message,
      stack: err.stack,
      endpoint: endpoint,
      options: options
    });
    throw err;
  }
};

// 📝 Register User
export const registerUser = async (userData) => {
  try {
    console.log('📝 Registering user with data:', { ...userData, password: '[HIDDEN]' });
    
    const response = await apiCall('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      console.log('✅ User registered and token stored');
    }

    return response;
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
};

// 🔐 Login User
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 Logging in user:', email);
    
    const response = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      console.log('✅ User logged in and token stored');
    }

    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

// 🔄 Send Password Reset Email
export const sendPasswordResetEmail = async (email) => {
  try {
    console.log('🔄 Sending password reset email to:', email);
    
    const response = await apiCall('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    console.log('✅ Password reset email sent successfully');
    return response;
  } catch (error) {
    console.error('❌ Password reset error:', error);
    
    // Handle specific error cases for better UX
    if (error.message?.includes('user-not-found')) {
      throw new Error('No account found with this email address.');
    } else if (error.message?.includes('invalid-email')) {
      throw new Error('Please enter a valid email address.');
    } else if (error.message?.includes('too-many-requests')) {
      throw new Error('Too many requests. Please try again later.');
    }
    
    throw error;
  }
};

// 👤 Get User Profile
export const getUserProfile = async () => {
  try {
    console.log('👤 Getting user profile...');
    const response = await apiCall('/profile');
    console.log('✅ Profile retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get profile error:', error);
    throw error;
  }
};

// 📸 Enhanced Update User Profile with detailed logging
export const updateUserProfile = async (profileData) => {
  try {
    // Debug: Log what we're sending
    console.log('📤 Profile data being sent:', profileData);
    console.log('📤 Profile data type:', typeof profileData);
    console.log('📤 Profile data JSON:', JSON.stringify(profileData));
    console.log('📤 Has profilePhotoURL:', profileData.hasOwnProperty('profilePhotoURL'));
    console.log('📤 profilePhotoURL value:', profileData.profilePhotoURL);
    console.log('📤 profilePhotoURL type:', typeof profileData.profilePhotoURL);
    
    const token = await AsyncStorage.getItem('userToken');
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token length:', token ? token.length : 0);
    
    // Validate input data
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Invalid profile data: must be an object');
    }

    if (!profileData.profilePhotoURL || typeof profileData.profilePhotoURL !== 'string') {
      throw new Error('Invalid profilePhotoURL: must be a non-empty string');
    }

    const response = await apiCall('/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    console.log('✅ Update profile response:', response);
    return response;
  } catch (error) {
    console.error('❌ updateUserProfile detailed error:', {
      message: error.message,
      stack: error.stack,
      profileData: profileData,
      profileDataType: typeof profileData
    });
    throw error;
  }
};

// 🔓 Logout User
export const logoutUser = async () => {
  try {
    console.log('🔓 Logging out user...');
    await apiCall('/logout', { method: 'POST' });
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    console.log('✅ User logged out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Even if API call fails, remove local data
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    throw error;
  }
};

// ✅ Auth check
export const isAuthenticated = async () => {
  try {
    console.log('✅ Checking authentication...');
    const token = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData');

    console.log('🔑 Token exists:', !!token);
    console.log('👤 UserData exists:', !!userData);

    if (!token || !userData) {
      console.log('❌ No token or userData found');
      return { isAuth: false, user: null };
    }

    await apiCall('/verify');
    console.log('✅ Authentication verified');
    return { isAuth: true, user: JSON.parse(userData), token };
  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    return { isAuth: false, user: null };
  }
};

// 🧪 Test function for debugging
export const testUpdateProfile = async () => {
  try {
    console.log('🧪 Testing profile update...');
    
    const testData = {
      profilePhotoURL: "https://test-url.com/test-image.jpg"
    };
    
    console.log('🧪 Test data:', testData);
    
    const response = await updateUserProfile(testData);
    console.log('🧪 Test response:', response);
    
    return { success: true, message: 'Test completed successfully', response };
  } catch (error) {
    console.error('🧪 Test error:', error);
    return { success: false, message: error.message, error };
  }
};