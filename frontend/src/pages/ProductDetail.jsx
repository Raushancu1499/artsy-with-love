import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gift, Calendar, Heart, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API_BASE_URL from '../config/api';
import './ProductDetail.css';

const CURRENCY = '\u20B9';

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [giftMode, setGiftMode] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await res.json();
        if (!ignore) {
          setProduct(data);
        }
      } catch (error) {
        console.error('Fetch failed', error);
        if (!ignore) {
          setProduct(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      ...product,
      giftMode,
      giftMessage,
    });
    setNotice(`${product.name} added to cart.`);
  };

  if (loading) return <div className="container" style={{ padding: '4rem 0' }}>Loading...</div>;
  if (!product) return <div className="container" style={{ padding: '4rem 0' }}>Product not found.</div>;

  const imageSrc = product.images?.[0] || 'https://via.placeholder.com/600x600?text=Handmade+Gift';

  return (
    <div className="product-detail-page">
      <div className="container p-detail-container">
        <div className="p-detail-gallery">
          <div className="main-img-wrapper">
            <img src={imageSrc} alt={product.name} />
            {product.labels && product.labels.length > 0 && (
              <span className={`card-badge badge-${product.labels[0].toLowerCase().replace(' ', '-')}`}>
                {product.labels[0]}
              </span>
            )}
          </div>
        </div>

        <div className="p-detail-info">
          <h1 className="p-title">{product.name}</h1>
          <p className="p-price">
            {product.type === 'custom' ? 'Custom Pricing' : `${CURRENCY}${product.price}`}
          </p>
          <p className="p-desc">{product.description}</p>

          <div className="p-timeline">
            <Calendar size={18} className="p-icon" />
            <span>{product.productionTimeline}</span>
          </div>

          {product.stock !== undefined && product.type !== 'custom' && (
            <div className={`stock-status ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
              {product.stock === 0 ? (
                <span className="stock-alert">Currently out of stock</span>
              ) : product.stock <= 5 ? (
                <span className="stock-warning">Hurry, only {product.stock} left</span>
              ) : (
                <span className="stock-ready">Ready to ship ({product.stock} available)</span>
              )}
            </div>
          )}

          <div className="gift-mode-section">
            <label className="gift-mode-toggle">
              <input
                type="checkbox"
                checked={giftMode}
                onChange={(e) => setGiftMode(e.target.checked)}
              />
              <Gift size={20} className="p-icon" />
              <span>Make it a gift and include a note</span>
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
            <button
              type="button"
              className={`btn btn-primary w-100 ${product.stock === 0 && product.type !== 'custom' ? 'disabled-btn' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0 && product.type !== 'custom'}
            >
              <ShoppingBag size={18} />
              {product.stock === 0 && product.type !== 'custom' ? 'Currently Out of Stock' : 'Add to Cart'}
            </button>

            {product.type === 'custom' && (
              <Link to="/custom-order" className="btn btn-outline w-100">
                Request Custom Quote
              </Link>
            )}
          </div>

          {notice && (
            <div className="detail-notice detail-notice-success" style={{ marginTop: '1rem' }}>
              {notice}
            </div>
          )}

          <div className="p-trust">
            <div className="trust-item"><Heart size={18} /> Handmade with love</div>
            <div className="trust-item"><ShieldCheck size={18} /> Secure checkout</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
