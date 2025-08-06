import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaUser, FaLock } from 'react-icons/fa';
import './Auth.css';

function LoginForm({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    onLogin(formData);
  };

  return (
    <div className="auth-form">
      <h2>Welcome Back</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email"><FaUser /> Email</label>
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
          <label htmlFor="password"><FaLock /> Master Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your master password"
            required
          />
        </div>
        <button type="submit" className="primary-button">
          Log In
        </button>
      </form>
      <p className="form-switch">
        Don't have an account?
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