import { useEffect, useRef } from 'react';
import { Heart, Star, Sparkles, Package, Clock } from 'lucide-react';
import './About.css';

function About() {
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );
    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !elementsRef.current.includes(el)) elementsRef.current.push(el);
  };

  return (
    <div className="about-page">

      {/* ── HERO SECTION ── */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img src="/about_hero.png" alt="Handmade crochet gifts" className="about-hero-img" />
          <div className="about-hero-overlay" />
        </div>
        <div className="about-hero-content" ref={addRef}>
          <p className="about-eyebrow">
            <Sparkles size={16} /> Our Story
          </p>
          <h1 className="about-title">
            Crafting Memories,<br />
            <span className="about-title-accent">One Stitch at a Time</span>
          </h1>
          <p className="about-subtitle">
            Where every knot holds a feeling, and every gift tells a story.
          </p>
          <div className="about-hero-orbs">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>
        </div>
      </section>

      {/* ── INTRO TEXT SECTION ── */}
      <section className="about-intro container" ref={addRef}>
        <div className="about-intro-text reveal-up">
          <h2>A Brand Born from <span className="text-accent">Heart</span></h2>
          <p>
            Artsy With Love began with a simple, profound belief: <strong>gifts should feel thoughtful, not transactional.</strong> In a world of mass-produced goods, we longed for the warmth and personal touch that only handmade creations can bring.
          </p>
          <p>
            We design and painstakingly craft bespoke crochet pieces meant to be cherished forever. From the softest yarn to the final intricate knot, every single detail is considered. Whether it's a ready-to-buy soft toy for a child or a fully custom keepsake capturing a precious memory — our creations carry a piece of our heart.
          </p>
        </div>
        <div className="about-intro-stats reveal-up">
          <div className="stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-label">Handcrafted</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">❤️</span>
            <span className="stat-label">Made with Love</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">∞</span>
            <span className="stat-label">Custom Designs</span>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="about-features container">
        <div className="about-feature-card reveal-up" ref={addRef}>
          <div className="feature-img-wrap">
            <img src="/about_crafted.png" alt="Hands crocheting soft toy" />
            <div className="feature-img-badge">
              <Heart size={20} fill="currentColor" /> Crafted with Love
            </div>
          </div>
          <div className="feature-content">
            <h3>Hours of Dedicated Craft</h3>
            <p>Every piece is hand-crocheted over hours of careful, dedicated work. No shortcuts, no machines — just skilled hands, premium yarn, and a whole lot of patience to create something truly one-of-a-kind.</p>
            <ul className="feature-list">
              <li><Clock size={14} /> Hours per piece, not minutes</li>
              <li><Star size={14} /> Unique character, every time</li>
              <li><Package size={14} /> Gift-ready packaging included</li>
            </ul>
          </div>
        </div>

        <div className="about-feature-card about-feature-card--reverse reveal-up" ref={addRef}>
          <div className="feature-img-wrap">
            <img src="/about_quality.png" alt="Premium colorful yarn balls" />
            <div className="feature-img-badge">
              <Star size={20} fill="currentColor" /> Premium Quality
            </div>
          </div>
          <div className="feature-content">
            <h3>Only the Finest Materials</h3>
            <p>We exclusively source high-grade, sustainable yarns that are incredibly soft, hypoallergenic, and designed to last a lifetime. Because the people you gift deserve nothing but the best.</p>
            <ul className="feature-list">
              <li><Heart size={14} /> Hypoallergenic &amp; baby-safe</li>
              <li><Star size={14} /> Sustainably sourced yarns</li>
              <li><Sparkles size={14} /> Vibrant, fade-resistant colors</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── FLOATING EMOJI STRIP ── */}
      <div className="about-emoji-strip" aria-hidden="true">
        <div className="strip-inner">
          {['🧸', '🌸', '🎀', '✨', '🌷', '💝', '🧶', '🎁', '🌼', '💌', '🧸', '🌸', '🎀', '✨', '🌷', '💝', '🧶', '🎁', '🌼', '💌'].map((e, i) => (
            <span key={i} className="strip-emoji">{e}</span>
          ))}
          {/* duplicate for seamless loop */}
          {['🧸', '🌸', '🎀', '✨', '🌷', '💝', '🧶', '🎁', '🌼', '💌', '🧸', '🌸', '🎀', '✨', '🌷', '💝', '🧶', '🎁', '🌼', '💌'].map((e, i) => (
            <span key={`d-${i}`} className="strip-emoji">{e}</span>
          ))}
        </div>
      </div>

      {/* ── PROMISE BANNER ── */}
      <section className="about-promise container" ref={addRef}>
        <div className="about-promise-card reveal-up">
          <Sparkles size={40} className="promise-icon" />
          <h2>Our Promise to You</h2>
          <p>Every Artsy With Love creation arrives with a simple guarantee: if it doesn't make you smile, we'll make it right. Your happiness is stitched into every piece we create.</p>
          <a href="/products" className="btn btn-primary about-cta-btn">Shop the Collection →</a>
        </div>
      </section>

    </div>
  );
}

export default About;
