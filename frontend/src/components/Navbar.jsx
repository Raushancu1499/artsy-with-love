import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

function Navbar() {
  const { getCartCount } = useCart();
  
  return (
    <nav className="navbar glass-nav">
      <div className="container navbar-container">
        <button className="mobile-menu-btn" aria-label="Menu">
          <Menu size={24} />
        </button>

        <Link to="/" className="brand-logo">
          <Heart size={20} className="brand-icon" />
          <span className="brand-text">Artsy With Love</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Shop</Link>
          <Link to="/custom-order">Custom Gifts</Link>
          <Link to="/about">Our Story</Link>
        </div>

        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search">
            <Search size={22} />
          </button>
          <Link to="/cart" className="icon-btn cart-btn">
            <ShoppingBag size={22} />
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
