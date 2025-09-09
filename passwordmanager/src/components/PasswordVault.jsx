import { useState, useEffect } from 'react';
import PasswordItem from './PasswordItem';
import config from '../config';
import './passwordvault.css'
function PasswordVault() {
  const [passwords, setPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPassword, setNewPassword] = useState({
    website: '',
    websiteUrl: '',
    username: '',
    password: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [warning, setWarning] = useState(''); // For password breach warning
  const [breachCount, setBreachCount] = useState(0); // For HIBP breaches
  const [urlWarning, setUrlWarning] = useState(''); // For Safe Browsing warning

  // Fetch existing passwords
  useEffect(() => {
    const fetchPasswords = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${config.url}/api/passwords/getpasswords`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        setPasswords(Array.isArray(data.passwords) ? data.passwords : []);
      } catch (err) {
        setPasswords([]);
        console.error('Error fetching passwords:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPasswords();
  }, []);

  // Add new password to server
  const addPasswordToServer = async (passwordData) => {
    const response = await fetch(`${config.url}/api/passwords/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(passwordData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add password');
    return data;
  };

  // Check password breach with HIBP
  async function verifyPasswordBreach(password) {
    if (!password) {
      setWarning('');
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
        setWarning(`⚠️ This password has been seen ${data.count} times in breaches.`);
        setBreachCount(data.count);
      } else {
        setWarning('');
        setBreachCount(0);
      }
    } catch (err) {
      console.error("Error checking password breach:", err);
      setWarning('');
      setBreachCount(0);
    }
  }

  // Verify the URL before saving password and show warning below input
  async function verifyUrl(url) {
    try {
      const res = await fetch(`${config.url}/api/safe/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!data.safe) {
        const msg = `⚠️ This site may be unsafe! Threats: ${data.threats.map(t => t.threatType).join(", ")}`;
        setUrlWarning(msg);
        return false;
      }
      setUrlWarning('');
      return true;
    } catch (err) {
      console.error("Error verifying URL:", err);
      setUrlWarning('⚠️ Could not verify site safety. Proceed with caution.');
      return true; // fallback (allow saving if check fails)
    }
  }

  // Handle add password
  const handleAddPassword = async (e) => {
    e.preventDefault();

    try {
      // Safe Browsing check
      if (newPassword.websiteUrl) {
        const isSafe = await verifyUrl(newPassword.websiteUrl);
        if (!isSafe) return;
      }

      // If both checks pass, save password
      const passwordData = {
        website: newPassword.website,
        websiteUrl: newPassword.websiteUrl,
        username: newPassword.username,
        password: newPassword.password,
      };

      const result = await addPasswordToServer(passwordData);
      setPasswords(Array.isArray(result.passwords) ? result.passwords : []);
      setNewPassword({ website: '', websiteUrl: '', username: '', password: '' });
      setShowAddForm(false);
      setWarning('');
      setBreachCount(0);
      setUrlWarning('');
    } catch (err) {
      alert(err.message || 'Failed to add password');
    }
  };

  // Handle input changes (with live breach check for password field)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPassword(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      clearTimeout(window.hibpTimeout);
      window.hibpTimeout = setTimeout(() => {
        verifyPasswordBreach(value);
      }, 600);
    }
    if (name === "websiteUrl") {
      setUrlWarning(''); // Clear warning while editing
    }
  };

  // Handle delete password
  const handleDelete = async (passwordId) => {
    try {
      const response = await fetch(`${config.url}/api/passwords/delete/${passwordId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setPasswords(data.passwords);
      } else {
        alert(data.message || 'Failed to delete password');
      }
    } catch (err) {
      console.log(err);
      alert('Failed to delete password');
    }
  };

  // Filtered search
  const filteredPasswords = searchTerm
    ? passwords.filter(pw => 
        (pw.website && pw.website.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pw.username && pw.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pw.websiteUrl && pw.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : passwords;

  return (
    <div className="vault-container">
      <div className="vault-header">
        <h2>Password Vault</h2>
        <div className="vault-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            Add New Password
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading your passwords...</div>
      ) : (
        <div className="passwords-list">
          {Array.isArray(filteredPasswords) && filteredPasswords.length > 0 ? (
            filteredPasswords.map(password => (
              <PasswordItem 
                key={password._id}
                password={password}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="no-passwords">
              {searchTerm ? 'No matching passwords found' : 'No passwords saved yet'}
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Password</h3>
            <form onSubmit={handleAddPassword}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  style={{ color:'black'}}
                  value={newPassword.website}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="username">Username/Email</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  style={{ color:'black'}}
                  value={newPassword.username}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  style={{ color:'black'}}
                  value={newPassword.password}
                  onChange={handleChange}
                  required
                />
                {/* live breach feedback */}
                {breachCount > 0 && (
                  <p style={{ color: 'red', fontWeight: 'bold' }}>
                    ⚠️ This password has been breached {breachCount} times!
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="url">Website URL</label>
                <input
                  type="text"
                  id="websiteUrl"
                  name="websiteUrl"
                  style={{ color:'black'}}
                  value={newPassword.websiteUrl}
                  onChange={handleChange}
                  onBlur={async (e) => {
                    if (e.target.value) {
                      await verifyUrl(e.target.value);
                    } else {
                      setUrlWarning('');
                    }
                  }}
                />
                {urlWarning && (
                  <p style={{ color: 'orange', fontWeight: 'bold' }}>
                    {urlWarning}
                  </p>
                )}
              </div>
           
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button" 
                  disabled={!!warning || breachCount > 0}
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordVault;