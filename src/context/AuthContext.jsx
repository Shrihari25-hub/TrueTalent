import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set auth token for axios globally
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Verify token on initial load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (token) {
          setAuthToken(token);
          const response = await axios.get('/api/auth/me');
          setUser(response.data.data);
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });

      if (!response.data.token || !response.data.role) {
        throw new Error('Authentication data missing in response');
      }

      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser({
      id: response.data.user?.id,
      name: response.data.user?.name,
      email: response.data.user?.email,
      role: response.data.role // Use role from response
    });
      setAuthToken(response.data.token);

      return {  success: true, 
        user: {
          ...response.data.user,
          role: response.data.role
        } 
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
      
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthToken(null);
    navigate('/login');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message || 'Reset link sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset link'
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.put(`/api/auth/reset-password/${token}`, {
        password: newPassword
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user || null);
        setAuthToken(response.data.token);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.data);
      return { success: true, user: response.data.data };
    } catch (error) {
      logout();
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}