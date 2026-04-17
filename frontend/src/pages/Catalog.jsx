import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import API_BASE_URL from '../config/api';
import './Catalog.css';

function Catalog() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'Soft Toys', 'Flowers', 'Keychains', 'Combos'];

  const filteredProducts = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="container">
          <p className="text-accent" style={{fontSize: '1.5rem', marginBottom: '0'}}>Our Collection</p>
          <h1 className="page-title">Handcrafted Treasures</h1>
          <p>
            Explore our curated selection of artisanal crochet gifts, 
            each made with precision and a whole lot of love.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="catalog-container">
          {/* Sidebar Filters */}
          <aside className="filters">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h3>Categories</h3>
              <span style={{fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '600'}}>{filteredProducts.length} Items</span>
            </div>
            <ul className="filter-list">
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    className={`filter-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="product-grid">
            {loading ? (
              <p>Loading products...</p>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p>No products found. Add some from the Admin panel!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catalog;
