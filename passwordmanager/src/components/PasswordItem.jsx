import React, { useState } from 'react';
import { FiExternalLink, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import './passworditem.css'
export default function PasswordItem({ password, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-item">
      <div>
        <strong style={{ color: '#ffff' }}>{password.website}</strong>
        {password.websiteUrl && (
          <a 
            href={password.websiteUrl.startsWith('http') ? password.websiteUrl : `https://${password.websiteUrl}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ marginLeft: 8 }}
            title="Visit website"
          >
            <FiExternalLink />
          </a>
        )}
      </div>
      <div>Username: {password.username}</div>
      <div className="password-display1">
        Password:{" "}
        <span className="password-text1">
          {showPassword ? password.password : "••••••••"}
        </span>
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="eye-button"
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      <button
        className="delete-btn"
        onClick={() => onDelete(password._id)}
        title="Delete password"
      >
        <FiTrash2 /> Delete
      </button>
    </div>
  );
}