function About() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <section className="premium-card" style={{ padding: '2.5rem' }}>
        <p className="text-accent" style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Our Story</p>
        <h1 className="page-title">Handmade gifting with a softer, more personal touch.</h1>
        <p style={{ marginTop: '1rem', color: 'var(--text-light)', lineHeight: '1.8' }}>
          Artsy With Love is built around one idea: gifts should feel thoughtful, not transactional. We design and
          craft crochet pieces that are meant to be remembered, whether they are simple ready-to-buy items or fully
          custom keepsakes.
        </p>
        <p style={{ marginTop: '1rem', color: 'var(--text-light)', lineHeight: '1.8' }}>
          The shop is built to make browsing, ordering, and custom requests feel easy for customers and manageable for
          the team behind the scenes.
        </p>
      </section>
    </div>
  );
}

export default About;
