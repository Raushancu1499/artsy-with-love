import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gift, Calendar, Heart, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API_BASE_URL from '../config/api';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [giftMode, setGiftMode] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p._id === id);
        setProduct(found);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch failed", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  if (loading) return <div className="container" style={{padding: '4rem 0'}}>Loading...</div>;
  if (!product) return <div className="container" style={{padding: '4rem 0'}}>Product not found.</div>;

  return (
    <div className="product-detail-page">
      <div className="container p-detail-container">
        
        {/* Gallery */}
        <div className="p-detail-gallery">
          <div className="main-img-wrapper">
            <img 
              src={(product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/600x600?text=Handmade+Gift'} 
              alt={product.name} 
            />
            {product.labels && product.labels.length > 0 && (
              <span className={`card-badge badge-${product.labels[0].toLowerCase().replace(' ', '-')}`}>
                {product.labels[0]}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-detail-info">
          <h1 className="p-title">{product.name}</h1>
          <p className="p-price">{product.type === 'custom' ? 'Custom Pricing' : `₹${product.price}`}</p>
          <p className="p-desc">{product.description}</p>

          <div className="p-timeline">
            <Calendar size={18} className="p-icon" />
            <span>{product.productionTimeline}</span>
          </div>

          <div className="gift-mode-section">
            <label className="gift-mode-toggle">
              <input 
                type="checkbox" 
                checked={giftMode} 
                onChange={(e) => setGiftMode(e.target.checked)} 
              />
              <Gift size={20} className="p-icon" />
              <span>Make it a Gift (Hide prices and add a note)</span>
            </label>

            {giftMode && (
              <textarea 
                className="gift-note-input"
                placeholder="Write a sweet message..."
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
              />
            )}
          </div>

          <div className="p-actions">
            {product.type === 'custom' ? (
              <Link to="/custom-order" className="btn btn-primary w-100">Request Customization</Link>
            ) : (
              <button className="btn btn-primary w-100" onClick={handleAddToCart}>Add to Cart</button>
            )}
          </div>

          {/* Trust badges */}
          <div className="p-trust">
            <div className="trust-item"><Heart size={18} /> Handmade with love</div>
            <div className="trust-item"><ShieldCheck size={18} /> Secure Checkout</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductDetail;
