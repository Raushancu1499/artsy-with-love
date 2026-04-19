import { Heart, Sparkles, Star } from 'lucide-react';

function About() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <section className="premium-card" style={{ padding: '3.5rem', textAlign: 'center', marginBottom: '2rem' }}>
        <p className="text-accent" style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
          <Sparkles size={18} /> Our Story
        </p>
        <h1 className="page-title" style={{ fontSize: '2.8rem', lineHeight: '1.2', marginBottom: '1.5rem' }}>
          Crafting Memories, One Stitch at a Time
        </h1>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ marginTop: '1.5rem', fontSize: '1.2rem', color: 'var(--text-color)', lineHeight: '1.8' }}>
            Artsy With Love began with a simple, profound idea: <strong>gifts should feel thoughtful, not transactional</strong>. In a world of mass-produced goods, we longed for the warmth and personal touch that only handmade creations can bring.
          </p>
          <p style={{ marginTop: '1.5rem', color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            We design and painstakingly craft bespoke crochet pieces that are meant to be cherished forever. From the softest yarn to the final intricate knot, every detail is considered. Whether it's a ready-to-buy soft toy to comfort a child or a fully custom keepsake capturing a unique memory, our creations carry a piece of our heart.
          </p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="premium-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--accent-pink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white', opacity: '0.9' }}>
            <Heart size={30} fill="currentColor" />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Crafted with Love</h3>
          <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>Every piece is hand-crocheted over hours of dedicated work, ensuring unparalleled quality and a distinct character you won't find on a factory line.</p>
        </div>

        <div className="premium-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--accent-pink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white', opacity: '0.9' }}>
            <Star size={30} fill="currentColor" />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Premium Quality</h3>
          <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>We exclusively use high-grade, sustainable yarns that are incredibly soft to the touch, hypoallergenic, and designed to stand the test of time.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
