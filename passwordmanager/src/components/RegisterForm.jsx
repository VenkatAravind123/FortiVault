import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';
import config from '../config';
function RegisterForm({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    masterPassword: '',
    confirmPassword: ''
  });

  const [breachWarning, setBreachWarning] = useState('');
const [breachCount, setBreachCount] = useState(0);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  //   if (error) setError('');
  // };

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  if (error) setError('');

  // Live breach check for master password
  if (name === "masterPassword") {
    clearTimeout(window.hibpTimeout);
    window.hibpTimeout = setTimeout(() => {
      verifyPasswordBreach(value);
    }, 600);
  }
};

  const validatePassword = (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 12 characters long';
    }
    if (!hasUpperCase || !hasLowerCase) {
      return 'Password must contain both uppercase and lowercase letters';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  };
const verifyPasswordBreach = async (password) => {
  if (!password) {
    setBreachWarning('');
    setBreachCount(0);
    return;
  }
  try {
    const res = await fetch(`${config.url}/api/safe/checkpassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.breached) {
      setBreachWarning(`⚠️ This password has been seen ${data.count} times in breaches.`);
      setBreachCount(data.count);
    } else {
      setBreachWarning('');
      setBreachCount(0);
    }
  } catch (err) {
    setBreachWarning('');
    setBreachCount(0);
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) throw new Error('Please enter a valid email address');

      const passwordError = validatePassword(formData.masterPassword);
      if (passwordError) throw new Error(passwordError);

      if (formData.masterPassword !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (breachCount > 0) {
  throw new Error('Please choose a password that has not been breached.');
}

      // Prepare data for backend: use 'masterPassword' field
      const { name, email, masterPassword } = formData;
      await onRegister({ name, email, masterPassword });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Create Your Account</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">
            <FaUser className="input-icon" /> Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            <FaEnvelope className="input-icon" /> Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="masterPassword">
            <FaLock className="input-icon" /> Master Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="masterPassword"
              name="masterPassword"
              value={formData.masterPassword}
              onChange={handleChange}
              placeholder="Create a strong master password"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {breachCount > 0 && (
  <p style={{ color: 'red', fontWeight: 'bold' }}>
    {breachWarning}
  </p>
)}
          </div>
          <p className="form-help">
            Password must be at least 12 characters long and include uppercase, lowercase, 
            numbers, and special characters.
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">
            <FaLock className="input-icon" /> Confirm Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your master password"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex="-1"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <p className="form-switch">
        Already have an account?{' '}
        <button 
          onClick={onSwitchToLogin} 
          className="text-button"
          disabled={isSubmitting}
        >
          Log In
        </button>
      </p>
    </div>
  );
}

RegisterForm.propTypes = {
  onRegister: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func.isRequired
};

export default RegisterForm;