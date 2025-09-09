import { useState, useEffect } from 'react';
import config from '../config';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalPasswords: 0,
    safePasswords: 0,
    breachedPasswords: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // Fetch users list (admin only)
        const usersResponse = await fetch(`${config.url}/api/auth/admin/users`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch admin data');
        }
        
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
        
        // Fetch stats
        const statsResponse = await fetch(`${config.url}/api/auth/admin/stats`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const statsData = await statsResponse.json();
        setStats(statsData);
        
      } catch (err) {
        console.error('Admin data fetch error:', err);
        setError('Failed to load admin data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${config.url}/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh user list
      setUsers(users.filter(user => user._id !== userId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1
      }));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };
  
  if (isLoading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }
  
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Total Passwords</h3>
          <div className="stat-value">{stats.totalPasswords}</div>
        </div>
        <div className="stat-card">
          <h3>Safe Passwords</h3>
          <div className="stat-value">{stats.safePasswords}%</div>
        </div>
        <div className="stat-card danger">
          <h3>Breached Passwords</h3>
          <div className="stat-value">{stats.breachedPasswords}</div>
        </div>
      </div>
      
      <div className="admin-users">
        <h3>User Management</h3>
        {users.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Passwords</th>
                {/* <th>Created At</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.passwordCount || 0}</td>
                  {/* <td>{new Date(user.createdAt).toLocaleDateString()}</td> */}
                  <td className="actions-cell">
                    <button 
                      className="delete-btn1" 
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={user.role === 'admin'} // Prevent deleting admins
                      title={user.role === 'admin' ? "Cannot delete admin users" : "Delete user"}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No users found</p>
        )}
      </div>
      
      <div className="admin-section">
        <h3>System Information</h3>
        <div className="system-info">
          <div className="info-item">
            <span className="info-label">Server Status:</span>
            <span className="info-value status-ok">Online</span>
          </div>
          <div className="info-item">
            <span className="info-label">Database Connection:</span>
            <span className="info-value status-ok">Connected</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Backup:</span>
            <span className="info-value">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;