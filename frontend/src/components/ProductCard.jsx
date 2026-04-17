import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import './ProductCard.css';

  const isOutOfStock = product.stock === 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'sold-out' : ''}`}>
      <Link to={`/product/${product._id}`} className="product-img-link">
        <div className="product-img-container">
          <img src={(product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/300x300?text=Handmade+Gift'} alt={product.name} />
          {isOutOfStock ? (
            <span className="card-badge badge-sold-out">Sold Out</span>
          ) : product.labels && product.labels.length > 0 && (
            <span className={`card-badge badge-${product.labels[0].toLowerCase().replace(' ', '-')}`}>{product.labels[0]}</span>
          )}
        </div>
      </Link>
      <div className="product-info">
        <Link to={`/product/${product._id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p className="product-price">
          {product.type === 'custom' ? 'Custom Pricing' : `₹${product.price}`}
        </p>
        <Link to={product.type === 'custom' ? '/custom-order' : `/product/${product._id}`} 
              className={`btn btn-outline card-btn ${isOutOfStock ? 'disabled' : ''}`}>
          {isOutOfStock ? 'Out of Stock' : (product.type === 'custom' ? 'Request Custom' : 'View Details')}
        </Link>
      </div>
    </div>
  );

export default ProductCard;
