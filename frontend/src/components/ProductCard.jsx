import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const CURRENCY = '\u20B9';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock === 0;
  const imageSrc = product.images?.[0] || product.image || 'https://via.placeholder.com/300x300?text=Handmade+Gift';

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'sold-out' : ''}`}>
      <Link to={`/product/${product._id}`} className="product-img-link">
        <div className="product-img-container">
          <img src={imageSrc} alt={product.name} />
          {isOutOfStock ? (
            <span className="card-badge badge-sold-out">Sold Out</span>
          ) : product.labels && product.labels.length > 0 ? (
            <span className={`card-badge badge-${product.labels[0].toLowerCase().replace(' ', '-')}`}>{product.labels[0]}</span>
          ) : null}
        </div>
      </Link>

      <div className="product-info">
        <Link to={`/product/${product._id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p className="product-price">
          {product.type === 'custom' ? 'Custom Pricing' : `${CURRENCY}${product.price}`}
        </p>

        <div className="product-actions">
          <button
            type="button"
            className="btn btn-primary card-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingBag size={16} />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link to={`/product/${product._id}`} className="btn btn-outline card-btn">
            <Eye size={16} />
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
