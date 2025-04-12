// pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '',
    age: '',
    educationStatus: 'school',
    phoneNumber: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join us and start your journey</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="form-input"
              placeholder="Choose a username"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="Enter your email"
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
              placeholder="Create a password"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="age" className="form-label">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              required
              min="1"
              max="120"
              className="form-input"
              placeholder="Enter your age"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="educationStatus" className="form-label">Education Status</label>
            <select
              id="educationStatus"
              name="educationStatus"
              required
              className="form-input"
              onChange={handleChange}
            >
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="working">Working</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              pattern="[0-9]{10}"
              maxLength="10"
              className="form-input"
              placeholder="Enter 10-digit phone number"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="loading-spinner mr-2"></span>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="auth-link-container">
            <p className="auth-link-text">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="auth-link"
              >
                Login here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
