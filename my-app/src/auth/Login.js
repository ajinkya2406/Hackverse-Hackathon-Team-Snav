// pages/Login.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL?.trim() || 'https://hackverse-hackathon-team-snav.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Change this to false for Vercel deployment
});

// Add response interceptor to handle CORS errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.message.includes('Network Error')) {
      return Promise.reject(new Error('Unable to connect to server. Please try again later.'));
    }
    return Promise.reject(error);
  }
);

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token before redirecting
      api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => navigate('/'))
      .catch((err) => {
        console.error('Token verification error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Log the request URL for debugging
      console.log('Making login request to:', `${api.defaults.baseURL}/auth/login`);
      
      const response = await api.post('/auth/login', formData);
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // Server responded with an error
        console.error('Server error response:', err.response);
        setError(err.response.data?.error || `Login failed (${err.response.status}). Please try again.`);
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        setError('No response from server. Please check your internet connection and try again.');
      } else {
        // Error in request setup
        console.error('Request setup error:', err.message);
        setError(`An error occurred: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="checkbox-container">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="checkbox-input"
              />
              <label htmlFor="remember-me" className="checkbox-label">
                Remember me
              </label>
            </div>

            <Link to="/forgot-password" className="forgot-password">
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="loading-spinner mr-2"></span>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="auth-link-container">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
