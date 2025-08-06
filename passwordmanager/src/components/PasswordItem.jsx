import { useState, useEffect } from 'react';
import PasswordItem from './PasswordItem';

function PasswordVault() {
  const [passwords, setPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPassword, setNewPassword] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration - would be fetched from API in production
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPasswords([
        {
          id: '1',
          title: 'Gmail',
          username: 'user@gmail.com',
          password: 'Encrypted_Password_1',
          url: 'https://mail.google.com',
          notes: 'Personal email account',
          lastUpdated: '2023-04-10'
        },
        {
          id: '2',
          title: 'GitHub',
          username: 'developer123',
          password: 'Encrypted_Password_2',
          url: 'https://github.com',
          notes: 'Work account',
          lastUpdated: '2023-03-25'
        },
        {
          id: '3',
          title: 'Netflix',
          username: 'family.account',
          password: 'Encrypted_Password_3',
          url: 'https://netflix.com',
          notes: 'Family subscription',
          lastUpdated: '2023-02-18'
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleAddPassword = (e) => {
    e.preventDefault();
    
    // In production, would encrypt password before saving
    const newEntry = {
      id: Date.now().toString(),
      ...newPassword,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setPasswords([...passwords, newEntry]);
    setNewPassword({ title: '', username: '', password: '', url: '', notes: '' });
    setShowAddForm(false);
  };

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
        pw.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pw.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pw.url.toLowerCase().includes(searchTerm.toLowerCase())
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
          {filteredPasswords.length > 0 ? (
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
                  id="title"
                  name="title"
                  value={newPassword.title}
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
                  type="url"
                  id="url"
                  name="url"
                  value={newPassword.url}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newPassword.notes}
                  onChange={handleChange}
                  rows="3"
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