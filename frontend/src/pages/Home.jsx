import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import './Home.css';

function Home() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch home categories", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-subtitle">Handmade with Love</span>
            <h1 className="hero-title">Turning Threads into Memories</h1>
            <p className="hero-desc">
              Discover soft, aesthetic, and emotional handmade crochet gifts.
              Perfect for birthdays, anniversaries, and creating lasting smiles.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">Shop Collection</Link>
              {!isAdmin && <Link to="/custom-order" className="btn btn-outline">Request Custom Gift</Link>}
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img src="/assets/images/hero.png" alt="Handmade Crochet Bouquet" className="hero-main-img" />
            <div className="hero-floating-card">
              <img src="/assets/images/detail.png" alt="Crochet Detail" />
              <span>100% Cotton Thread</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section categories-section">
        <div className="container text-center">
          <h2 className="section-title text-accent">Shop by Category</h2>
          <p style={{marginBottom: '3rem', color: 'var(--text-light)'}}>Explore our handcrafted collections</p>
          <div className="category-grid">
            {loading ? (
              <p>Curating collections...</p>
            ) : categories.length > 0 ? (
              categories.map(cat => (
                <Link key={cat.name} to={`/products?category=${cat.name}`} className="category-card">
                  <div className="category-img">
                    <img 
                      src={cat.image || '/assets/images/cat-flowers.png'} 
                      alt={cat.name} 
                    />
                  </div>
                  <h3>{cat.name}</h3>
                </Link>
              ))
            ) : (
              <p>Our artisan collections are warming up!</p>
            )}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section experience-section" style={{background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', margin: '0 20px'}}>
        <div className="container">
          <div className="experience-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center'}}>
            <div className="experience-img premium-card">
              <img src="/assets/images/gift.png" alt="Gift Packaging" style={{width: '100%', display: 'block'}} />
            </div>
            <div className="experience-content">
              <h2 className="text-accent" style={{fontSize: '2.5rem', marginBottom: '20px'}}>The Perfect Gift Experience</h2>
              <p style={{fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text-dark)'}}>
                Every order is carefully packaged with tissue paper, a custom note, and a whole lot of intention. 
                Whether it's for a newborn, a partner, or yourself, we make sure the unboxing is as beautiful as the gift itself.
              </p>
              {!isAdmin && <Link to="/custom-order" className="btn btn-primary" style={{marginTop: '30px'}}>Create a Custom Request</Link>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
