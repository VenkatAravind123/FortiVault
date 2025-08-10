import React, { useState } from 'react';

export default function PasswordItem({ password, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-item">
      <div>
        <strong>{password.website}</strong>
        {password.websiteUrl && (
          <a href={password.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
            Visit
          </a>
        )}
      </div>
      <div>Username: {password.username}</div>
      <div>
        Password:{" "}
        {showPassword ? password.password : "••••••••"}
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          style={{ marginLeft: 8 }}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <button
        className="delete-btn"
        onClick={() => onDelete(password.id)}
        style={{ marginTop: 8 }}
      >
        Delete
      </button>
    </div>
  );
}