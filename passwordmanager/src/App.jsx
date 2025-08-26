import { useState, useEffect } from 'react';
import './App.css';
import './components/Auth.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PasswordVault from './components/PasswordVault';
import PasswordGenerator from './components/PasswordGenerator';
import LoadingSpinner from './components/LoadingSpinner';
import logo from './assets/vault.png';
import config from './config'
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${config.url}/api/auth/verify`, {
          method: "GET",
          credentials: "include", // <-- Important!
        });

        if (!res.ok) {
          throw new Error("Session expired");
        }
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setCurrentView('vault');
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthenticated(false);
        setCurrentView('login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Update the handleLogin function
  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // <-- Important!
        body: JSON.stringify(credentials)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Invalid response format');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setIsAuthenticated(true);
      setCurrentView('vault');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Server connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleRegister function similarly
  const handleRegister = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.url}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // <-- Important!
        body: JSON.stringify(userData)
      });

      let data;
      try {
        data = await response.json();
        console.log('Registration response:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid server response');
      }

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        setCurrentView('vault');
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error details:', error);
      setError(error.message || 'Server connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  

  const handleLogout = async () => {
    try {
      await fetch(`${config.url}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setIsAuthenticated(false);
      setCurrentView('login');
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  const renderAuthContent = () => {
    if (currentView === 'login') {
      return (
        <LoginForm 
          onLogin={handleLogin} 
          onSwitchToRegister={() => setCurrentView('register')}
          error={error}
        />
      );
    }
    return (
      <RegisterForm 
        onRegister={handleRegister} 
        onSwitchToLogin={() => setCurrentView('login')}
        error={error}
      />
    );
  };

  const renderAppContent = () => {
    switch (currentView) {
      case 'vault':
        return <PasswordVault user={user} />;
      case 'generator':
        return <PasswordGenerator />;
      default:
        return <PasswordVault user={user} />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="password-manager">
      <header>
        <div className="logo-section">
          <img src={logo} alt="Password Manager Logo" className="app-logo" />
          <h1>Secure Password Manager</h1>
        </div>
        {isAuthenticated && (
          <div className="header-wrapper">
            <nav>
              <button 
                className={currentView === 'vault' ? 'active' : ''}
                onClick={() => setCurrentView('vault')}
              >
                Password Vault
              </button>
              <button 
                className={currentView === 'generator' ? 'active' : ''}
                onClick={() => setCurrentView('generator')}
              >
                Password Generator
              </button>
            </nav>
            
            <div className="user-section">
              <span className="user-email">{user.email}</span>
              <button 
                onClick={handleLogout} 
                className="logout-button"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
      
      <main>
        {error && !isAuthenticated && (
          <div className="error-banner">
            {error}
            <button 
              className="error-close" 
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}
        {isAuthenticated ? renderAppContent() : renderAuthContent()}
      </main>
      
      <footer>
        <p>© {new Date().getFullYear()} Secure Password Manager | Enterprise Edition</p>
      </footer>
    </div>
  );
}

export default App;