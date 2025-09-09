import { useState, useEffect } from 'react';
import './passwordgenerator.css'
function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  });

  // Generate password whenever options change
  useEffect(() => {
    generatePassword();
  }, [options]);

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions({
      ...options,
      [name]: type === 'checkbox' ? checked : Number(value)
    });
  };

  const generatePassword = () => {
    let charset = '';
    let newPassword = '';
    
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
    const numberChars = '23456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Characters to exclude if excludeSimilar is true
    const similarChars = 'il1Lo0O';
    const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';
    
    if (options.uppercase) charset += uppercaseChars;
    if (options.lowercase) charset += lowercaseChars;
    if (options.numbers) charset += numberChars;
    if (options.symbols) charset += symbolChars;
    
    if (options.excludeSimilar) {
      charset = charset.split('')
        .filter(char => !similarChars.includes(char))
        .join('');
    }
    
    if (options.excludeAmbiguous) {
      charset = charset.split('')
        .filter(char => !ambiguousChars.includes(char))
        .join('');
    }
    
    if (charset.length === 0) {
      setPassword('Please select at least one character type');
      return;
    }
    
    for (let i = 0; i < options.length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    
    setPassword(newPassword);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculatePasswordStrength = () => {
    if (!password || typeof password !== 'string') return 'weak';
    
    let score = 0;
    
    // Length
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    
    // Character types
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 2;
    
    // Variation
    const uniqueChars = new Set(password).size;
    if (uniqueChars > password.length * 0.7) score += 1;
    
    if (score >= 6) return 'strong';
    if (score >= 4) return 'medium';
    return 'weak';
  };

  const strengthClass = calculatePasswordStrength();

  return (
    <div className="generator-container">
      <h2>Password Generator</h2>
      
      <div className="generated-password">
        <div className="password-display">{password}</div>
        <div className="password-actions">
          <button 
            className="refresh-button" 
            onClick={generatePassword}
            title="Generate new password"
          >
            Refresh
          </button>
          <button 
            className="copy-button" 
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            Copy
          </button>
        </div>
      </div>
      
      <div className={`password-strength ${strengthClass}`}>
        <span className="strength-label">Strength:</span>
        <span className="strength-value">{strengthClass.charAt(0).toUpperCase() + strengthClass.slice(1)}</span>
        <div className="strength-meter">
          <div className={`strength-bar ${strengthClass}`}></div>
        </div>
      </div>
      
      {copied && <div className="copied-notification">Copied to clipboard!</div>}
      
      <div className="generator-options">
        <div className="option-group">
          <label htmlFor="length">Password Length: {options.length}</label>
          <input
            type="range"
            id="length"
            name="length"
            min="8"
            max="32"
            value={options.length}
            onChange={handleOptionChange}
          />
          <span className="range-value">{options.length}</span>
        </div>
        
        <div className="checkbox-options">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="uppercase"
              name="uppercase"
              checked={options.uppercase}
              onChange={handleOptionChange}
            />
            <label htmlFor="uppercase">Include Uppercase Letters (A-Z)</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="lowercase"
              name="lowercase"
              checked={options.lowercase}
              onChange={handleOptionChange}
            />
            <label htmlFor="lowercase">Include Lowercase Letters (a-z)</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="numbers"
              name="numbers"
              checked={options.numbers}
              onChange={handleOptionChange}
            />
            <label htmlFor="numbers">Include Numbers (0-9)</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="symbols"
              name="symbols"
              checked={options.symbols}
              onChange={handleOptionChange}
            />
            <label htmlFor="symbols">Include Symbols (!@#$%^&*)</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="excludeSimilar"
              name="excludeSimilar"
              checked={options.excludeSimilar}
              onChange={handleOptionChange}
            />
            <label htmlFor="excludeSimilar">Exclude Similar Characters (i, l, 1, L, o, 0, O)</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="excludeAmbiguous"
              name="excludeAmbiguous"
              checked={options.excludeAmbiguous}
              onChange={handleOptionChange}
            />
            <label htmlFor="excludeAmbiguous">Exclude Ambiguous Characters ({}, [], (), etc.)</label>
          </div>
        </div>
      </div>
      
      <div className="security-tips">
        <h3>Password Security Tips</h3>
        <ul>
          <li>Use at least 12-16 characters for important accounts</li>
          <li>Mix uppercase, lowercase, numbers, and symbols</li>
          <li>Don't reuse passwords across different sites</li>
          <li>Change passwords periodically, especially for sensitive accounts</li>
          <li>Consider using a passphrase for better memorability and security</li>
        </ul>
      </div>
    </div>
  );
}

export default PasswordGenerator;