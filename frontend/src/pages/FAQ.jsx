const faqItems = [
  {
    question: 'How do I place an order?',
    answer: 'Browse the products, add what you want to cart, fill in your delivery details, and complete payment through UPI.',
  },
  {
    question: 'Can I request a custom piece?',
    answer: 'Yes. Use the custom order page or WhatsApp to send inspiration, size, and timing details.',
  },
  {
    question: 'Do you offer editing of custom orders after purchase?',
    answer: 'Admin can update product details from the marketplace panel, and customers can remove or update cart items before checkout.',
  },
];

function FAQ() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <section className="premium-card" style={{ padding: '2.5rem' }}>
        <p className="text-accent" style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>FAQ</p>
        <h1 className="page-title">Common questions, answered.</h1>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          {faqItems.map((item) => (
            <details key={item.question} className="premium-card" style={{ padding: '1rem 1.25rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-dark)' }}>{item.question}</summary>
              <p style={{ marginTop: '0.75rem', color: 'var(--text-light)', lineHeight: '1.7' }}>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FAQ;
