import { useState, useEffect } from 'react';
import PasswordItem from './PasswordItem';

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

  // Mock data for demonstration - would be fetched from API in production
  // useEffect(() => {
  //   // Simulate API call
  //   setTimeout(() => {
  //     setPasswords([
  //       {
  //         id: '1',
  //         website: 'Gmail',
  //         username: 'user@gmail.com',
  //         password: 'Encrypted_Password_1',
  //         websiteUrl: 'https://mail.google.com',
  //         lastUpdated: '2023-04-10'
  //       },
  //       {
  //         id: '2',
  //         website: 'GitHub',
  //         username: 'developer123',
  //         password: 'Encrypted_Password_2',
  //         websiteUrl: 'https://github.com',
  //         lastUpdated: '2023-03-25'
  //       },
  //       {
  //         id: '3',
  //         website: 'Netflix',
  //         username: 'family.account',
  //         password: 'Encrypted_Password_3',
  //         websiteUrl: 'https://netflix.com',
  //         lastUpdated: '2023-02-18'
  //       }
  //     ]);
  //     setIsLoading(false);
  //   }, 800);
  // }, []); // <--- Make sure this is an empty array!
useEffect(() => {
  const fetchPasswords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:2025/api/passwords/getpasswords', {
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
  

  const addPasswordToServer = async (passwordData) => {
  const response = await fetch('http://localhost:2025/api/passwords/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(passwordData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add password');
  return data;
};

  const handleAddPassword = async (e) => {
    e.preventDefault();

    // In production, would encrypt password before saving
    try {
      const passwordData = {
        website: newPassword.website,
        websiteUrl: newPassword.websiteUrl,
        username: newPassword.username,
        password: newPassword.password,
        
      };
      const result = await addPasswordToServer(passwordData);
      setPasswords(Array.isArray(result.passwords) ? result.passwords : []);// Update with latest from server
      setNewPassword({ website: '', websiteUrl: '', username: '', password: '' });
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Failed to add password');
    }
  };

  // ---- These functions were incorrectly nested! ----
  const handleChange = (e) => {
    setNewPassword({
      ...newPassword,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = (id) => {
    setPasswords(passwords.filter(password => password.id !== id));
  };

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
                key={password.id}
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
                  value={newPassword.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="url">Website URL</label>
                <input
                  type="websiteUrl"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={newPassword.websiteUrl}
                  onChange={handleChange}
                />
              </div>
              
              
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
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