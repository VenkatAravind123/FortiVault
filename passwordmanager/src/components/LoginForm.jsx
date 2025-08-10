import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

function LoginForm({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    masterPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!formData.email || !formData.masterPassword) {
        throw new Error('Please fill in all fields');
      }
      
      await onLogin(formData);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-form">
      <h2>Welcome Back</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">
            <FaUser className="input-icon" /> Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
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
              placeholder="Enter your master password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        
        <button type="submit" className="primary-button">
          Log In
        </button>
      </form>
      
      <p className="form-switch">
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister} className="text-button">
          Create Account
        </button>
      </p>
    </div>
  );
}

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onSwitchToRegister: PropTypes.func.isRequired
};

export default LoginForm;