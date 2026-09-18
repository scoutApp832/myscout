import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ✅ Set default base URL for all axios requests
axios.defaults.baseURL = API_URL;

// ✅ Add a request interceptor to skip auth for file requests
axios.interceptors.request.use(
  config => {
    // Skip Authorization for static file requests
    if (config.url && (
      config.url.startsWith('/uploads/') ||
      config.url.includes('/uploads/') ||
      config.url.startsWith('http://localhost:5000/uploads/') ||
      config.url.includes('/uploads/reports/')
    )) {
      // Remove Authorization header for file requests
      delete config.headers.Authorization;
      return config;
    }
    
    // For all other requests, use the token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // ✅ Set axios default header when token exists
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      // ✅ Remove header if no token
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/profile`);
      
      console.log('📊 User profile loaded:', response.data.user);
      
      const userData = response.data.user;
      if (userData && !userData.permissions) {
        userData.permissions = {};
      }
      
      if (userData?.member?.profile_image) {
        userData.avatar_url = userData.member.profile_image;
      } else {
        userData.avatar_url = null;
      }
      
      setUser(userData);
      setPermissions(userData?.permissions || {});
      
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (user && !user.permissions) {
        user.permissions = {};
      }
      
      if (user?.member?.profile_image) {
        user.avatar_url = user.member.profile_image;
      } else {
        user.avatar_url = null;
      }
      
      console.log('🔑 Login successful:', user);
      
      setUser(user);
      setPermissions(user?.permissions || {});
      
      return { success: true, user };
      
    } catch (error) {
      console.log('❌ Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Sending registration data:', userData);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, user } = response.data;
      
      console.log('✅ Registration response:', response.data);
      
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        if (user && !user.permissions) {
          user.permissions = {};
        }
        
        if (user?.member?.profile_image) {
          user.avatar_url = user.member.profile_image;
        } else {
          user.avatar_url = null;
        }
        
        setUser(user);
        setPermissions(user?.permissions || {});
      }
      
      return { success: true, user, message: response.data.message };
      
    } catch (error) {
      console.log('❌ Register error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setPermissions({});
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('❌ Forgot password error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send reset link' 
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('❌ Reset password error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/change-password`, 
        { currentPassword, newPassword }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('❌ Change password error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change password' 
      };
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, data);
      
      const userData = response.data.user;
      
      if (userData?.member?.profile_image) {
        userData.avatar_url = userData.member.profile_image;
      } else {
        userData.avatar_url = null;
      }
      
      setUser(userData);
      setPermissions(userData?.permissions || {});
      
      return { success: true, message: response.data.message };
      
    } catch (error) {
      console.log('❌ Update profile error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  };

  const refreshUser = async () => {
    await fetchProfile();
    return user;
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    
    if (user.role === 'national_commissioner') {
      if (permissions[permissionName] === false) {
        return false;
      }
      return true;
    }
    
    return permissions[permissionName] === true;
  };

  const getAvatarUrl = () => {
    if (!user) return '';
    return user?.member?.profile_image || user?.avatar_url || '';
  };

  const getFullName = () => {
    if (!user) return 'User';
    return user.full_name || 'User';
  };

  const value = {
    user,
    loading,
    permissions,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    fetchProfile,
    refreshUser,
    hasPermission,
    getAvatarUrl,
    getFullName,
    isAuthenticated: !!user,
    isScout: user?.role === 'scout' || user?.role === 'unit_leader',
    isDistrict: user?.role === 'district_commissioner',
    isNational: user?.role === 'national_commissioner',
    isDonor: user?.role === 'donor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;