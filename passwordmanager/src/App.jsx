import { useState, useEffect } from 'react'
import './App.css'
import './components/Auth.css'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import PasswordVault from './components/PasswordVault'
import PasswordGenerator from './components/PasswordGenerator'
import logo from './assets/Vault.png' // Add your logo import
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // login, register, vault, generator
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (via stored token)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // In production: Verify token with backend
          // For demo: Just check if token exists
          setUser({
            email: localStorage.getItem('userEmail') || 'user@example.com',
            role: localStorage.getItem('userRole') || 'user'
          });
          setIsAuthenticated(true);
          setCurrentView('vault');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = (credentials) => {
    setIsLoading(true);
    // In production: API call to authenticate
    setTimeout(() => {
      // Mock successful login
      const mockUser = {
        id: '12345',
        email: credentials.email,
        role: 'user'
      };
      
      // Store auth data
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('userEmail', mockUser.email);
      localStorage.setItem('userRole', mockUser.role);
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setCurrentView('vault');
      setIsLoading(false);
    }, 800); // Simulate API delay
  };

  const handleRegister = (userData) => {
    setIsLoading(true);
    // In production: API call to register user
    setTimeout(() => {
      // Mock successful registration
      console.log('User registered:', userData);
      
      // Auto-login after registration
      handleLogin({
        email: userData.email,
        password: userData.password
      });
    }, 800); // Simulate API delay
  };

  const handleLogout = () => {
    // Clear stored auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  const renderAuthContent = () => {
    if (currentView === 'login') {
      return (
        <LoginForm 
          onLogin={handleLogin} 
          onSwitchToRegister={() => setCurrentView('register')} 
        />
      );
    } else {
      return (
        <RegisterForm 
          onRegister={handleRegister} 
          onSwitchToLogin={() => setCurrentView('login')} 
        />
      );
    }
  };

  const renderAppContent = () => {
    if (currentView === 'vault') {
      return <PasswordVault user={user} />;
    } else if (currentView === 'generator') {
      return <PasswordGenerator />;
    }
  };

  if (isLoading && !isAuthenticated) {
    return <div className="loading-container">Loading...</div>;
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
              <span className="user-email">{user?.email}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </div>
        )}
      </header>
      
      <main>
        {isAuthenticated ? renderAppContent() : renderAuthContent()}
      </main>
      
      <footer>
        <p>© 2025 Secure Password Manager | Enterprise Edition</p>
      </footer>
    </div>
  );
}

export default App;