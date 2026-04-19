import { Link } from 'react-router-dom';
import './Footer.css';
import { Heart, Camera } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <h2 className="footer-title text-accent">Artsy With Love</h2>
          <p className="footer-tagline">Turning Threads into Memories</p>
          <p className="footer-desc">Crafting unique, handmade crochet gifts that tell a story. Every stitch is made with intention and love.</p>
        </div>
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/products">Shop All</Link></li>
            <li><Link to="/custom-order">Custom Orders</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/about">Our Story</Link></li>
          </ul>
        </div>
        <div className="footer-social">
          <h3>Connect</h3>
          <a href="https://instagram.com/artsy_withlove" target="_blank" rel="noreferrer" className="social-link">
            <Camera size={20} />
            @artsy_withlove
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Artsy With Love. Handmade with <Heart size={12} fill="currentColor" /> in India.</p>
      </div>
    </footer>
  );
}

export default Footer;
