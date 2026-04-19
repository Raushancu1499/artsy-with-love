import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import { Sparkles, Heart, ArrowRight, Star, Package, Clock } from 'lucide-react';
import './Home.css';

const TRUST_ITEMS = [
  { icon: '🧸', label: 'Handcrafted' },
  { icon: '🌸', label: 'Premium Yarn' },
  { icon: '🎀', label: 'Gift Ready' },
  { icon: '✨', label: 'Custom Orders' },
  { icon: '💝', label: 'Made with Love' },
  { icon: '🧶', label: '100% Artisan' },
];

function Home() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const revealRefs = useRef([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => { setCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.12 }
    );
    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  const addRef = el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="h-hero">
        {/* Orb background */}
        <div className="h-hero-orb h-orb-1" />
        <div className="h-hero-orb h-orb-2" />
        <div className="h-hero-orb h-orb-3" />

        <div className="container h-hero-inner">
          <div className="h-hero-text">
            <div className="h-eyebrow">
              <Sparkles size={14} /> Handmade with Love
            </div>
            <h1 className="h-hero-title">
              Turning Threads<br />
              <span className="h-title-shimmer">into Memories</span>
            </h1>
            <p className="h-hero-desc">
              Discover soft, aesthetic, and emotional handmade crochet gifts.
              Perfect for birthdays, anniversaries, and creating lasting smiles.
            </p>
            <div className="h-hero-actions">
              <Link to="/products" className="h-btn-primary">
                Shop Collection <ArrowRight size={18} />
              </Link>
              {!isAdmin && (
                <Link to="/custom-order" className="h-btn-outline">
                  Custom Gift Request
                </Link>
              )}
            </div>

            {/* Mini trust bar */}
            <div className="h-trust-row">
              <span><Star size={12} fill="currentColor" /> 4.9 Rating</span>
              <span><Heart size={12} fill="currentColor" /> 100+ Happy Customers</span>
              <span><Package size={12} /> Gift-Ready Packaging</span>
            </div>
          </div>

          <div className="h-hero-visual">
            <div className="h-hero-img-ring" />
            <img src="/assets/images/hero.png" alt="Handmade Crochet Gift" className="h-hero-img" />
            <div className="h-floating-pill h-pill-1">
              <Heart size={14} fill="currentColor" /> 100% Handcrafted
            </div>
            <div className="h-floating-pill h-pill-2">
              🧸 Crochet Soft Toys
            </div>
            <div className="h-floating-pill h-pill-3">
              ✨ Custom Orders Open
            </div>
          </div>
        </div>
      </section>

      {/* ── SCROLLING TRUST MARQUEE ── */}
      <div className="h-marquee-strip">
        <div className="h-marquee-inner">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span key={i} className="h-marquee-item">
              <span>{item.icon}</span> {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="h-section container" ref={addRef}>
        <div className="h-section-header reveal-up">
          <p className="h-section-eye"><Sparkles size={15} /> Collections</p>
          <h2 className="h-section-title">Shop by Category</h2>
          <p className="h-section-sub">Explore our handcrafted collections, each crafted with premium yarn and love.</p>
        </div>
        <div className="h-cat-grid">
          {loading ? (
            [1,2,3,4].map(i => <div key={i} className="h-cat-skeleton" />)
          ) : categories.length > 0 ? (
            categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="h-cat-card reveal-up"
                ref={addRef}
                style={{ animationDelay: `${i * 0.1}s`, transitionDelay: `${i * 0.08}s` }}
              >
                <div className="h-cat-img">
                  <img src={cat.image || '/assets/images/cat-flowers.png'} alt={cat.name} />
                  <div className="h-cat-overlay">
                    <span>Explore <ArrowRight size={14} /></span>
                  </div>
                </div>
                <h3 className="h-cat-name">{cat.name}</h3>
              </Link>
            ))
          ) : (
            <p style={{ color: 'var(--text-light)', gridColumn: '1/-1', textAlign: 'center' }}>
              Our artisan collections are warming up! 🧶
            </p>
          )}
        </div>
      </section>

      {/* ── EXPERIENCE SECTION ── */}
      <section className="h-exp-section" ref={addRef}>
        <div className="container h-exp-inner">
          <div className="h-exp-img reveal-left" ref={addRef}>
            <img src="/assets/images/gift.png" alt="Gift Packaging" />
            <div className="h-exp-badge">
              <Clock size={14} /> Delivered with Care
            </div>
          </div>
          <div className="h-exp-content reveal-right" ref={addRef}>
            <p className="h-section-eye"><Heart size={14} fill="currentColor" /> The Experience</p>
            <h2 className="h-exp-title">The Perfect Gift Experience</h2>
            <p className="h-exp-desc">
              Every order is carefully packaged with tissue paper, a custom note, and a whole lot of intention.
              Whether it's for a newborn, a partner, or yourself — we make sure the unboxing feels as beautiful as the gift itself.
            </p>
            <div className="h-exp-features">
              <div className="h-exp-feat"><span>🎀</span> Elegant wrapping</div>
              <div className="h-exp-feat"><span>💌</span> Personalised note</div>
              <div className="h-exp-feat"><span>📦</span> Safe delivery</div>
              <div className="h-exp-feat"><span>✨</span> Premium finish</div>
            </div>
            {!isAdmin && (
              <Link to="/custom-order" className="h-btn-primary" style={{ display: 'inline-flex', marginTop: '2rem' }}>
                Create a Custom Request <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
