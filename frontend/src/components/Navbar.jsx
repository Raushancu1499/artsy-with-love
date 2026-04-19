import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Heart,
  Sun,
  Moon
} from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { getCartCount } = useCart();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim()) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/products');
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Account';

  const closeMenus = () => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="navbar glass-nav">
      {isAdmin && (
        <div className="admin-management-banner">
          <div className="container banner-flex">
            <span className="banner-status"><LayoutDashboard size={14} /> Management Mode Active</span>
            <div className="banner-links">
              <Link to="/admin">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      )}

      <div className="container navbar-container">
        <button
          type="button"
          className="mobile-menu-btn"
          aria-label="Menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
        >
          <Menu size={24} />
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
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setIsSearchOpen(true);
                setIsMobileMenuOpen(false);
              }}
              aria-label="Search"
            >
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
                  <span className="user-label">{firstName}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="user-dropdown-menu animate-fade-in">
                    <Link to="/profile" onClick={closeMenus}>View Profile</Link>
                    <Link to="/my-orders" onClick={closeMenus}>Order History</Link>
                    {isAdmin && <Link to="/admin" onClick={closeMenus}>Admin Panel</Link>}
                    <button type="button" onClick={logout} className="dropdown-logout-btn">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
              
              {!isAdmin && (
                <Link to="/my-orders" className="icon-btn" title="My Orders" onClick={closeMenus}>
                  <ShoppingBag size={20} />
                </Link>
              )}
              
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
  );
}

export default Navbar;
