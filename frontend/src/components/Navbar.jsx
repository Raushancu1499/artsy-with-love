import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  Search, 
  Heart,
  LogOut,
  Moon,
  Sun,
  UserCheck
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Navigation/Filter logic would go here
  };

  const firstName = user?.name?.split(' ')[0] || 'Account';

  return (
    <>
      {/* Admin Management Banner – sits above the sticky navbar in normal flow */}
      {isAdmin && (
        <div className="admin-management-banner">
          <div className="container banner-flex">
            <div className="banner-status">
              <UserCheck size={14} />
              <span>Management Mode Active</span>
            </div>
            <div className="banner-links">
              <Link to="/admin" onClick={closeMenus}>Go to Dashboard →</Link>
            </div>
          </div>
        </div>
      )}

      <nav className="navbar glass-nav">
      <div className="container navbar-container">
          <button 
            type="button" 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="brand-logo" onClick={closeMenus}>
            <Heart size={20} className="brand-icon" />
            <span className="brand-text">Artsy With Love</span>
          </Link>

          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/" onClick={closeMenus}>Home</Link>
            <Link to="/products" onClick={closeMenus}>Shop</Link>
            {!isAdmin && <Link to="/custom-order" onClick={closeMenus}>Custom Gifts</Link>}
            <Link to="/about" onClick={closeMenus}>Our Story</Link>
            <Link to="/faq" onClick={closeMenus}>FAQ</Link>
          </div>

          <div className="nav-actions">
            {isSearchOpen ? (
              <div className="search-group animate-slide-in">
                <input
                  type="text"
                  placeholder="Search treasures..."
                  className="nav-search-input"
                  autoFocus
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <button type="button" className="icon-btn" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button type="button" className="icon-btn search-btn" onClick={() => setIsSearchOpen(true)} aria-label="Search">
                <Search size={22} />
              </button>
            )}

            <Link to="/cart" className="icon-btn cart-btn" onClick={closeMenus}>
              <ShoppingBag size={22} />
              {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="user-nav-group">
                <div className="user-dropdown-container">
                  <button 
                    type="button" 
                    className={`icon-btn user-name ${isUserMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <User size={22} />
                    <span className="user-label">
                      {firstName}
                      {isAdmin && <span className="admin-indicator">ADMIN</span>}
                    </span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="user-dropdown-menu animate-fade-in" style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      position: 'absolute', 
                      top: '100%', 
                      right: '0', 
                      zIndex: 1000 
                    }}>
                      <Link to="/profile" onClick={closeMenus}>View Profile</Link>
                      {!isAdmin && <Link to="/my-orders" onClick={closeMenus}>Order History</Link>}
                      {isAdmin && <Link to="/admin" onClick={closeMenus}>Admin Dashboard</Link>}
                      <button type="button" onClick={logout} className="dropdown-logout-btn">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
                
                <button 
                  type="button" 
                  className="icon-btn theme-toggle" 
                  onClick={toggleTheme}
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />} 
                </button>
              </div>
            ) : (
              <Link to="/login" className="icon-btn login-nav-link" aria-label="Login" onClick={closeMenus}>
                <User size={22} />
                <span className="login-text">Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
