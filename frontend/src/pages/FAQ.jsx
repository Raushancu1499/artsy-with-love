import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, MessageCircle, ShoppingBag, Paintbrush, RotateCcw, Truck, Heart } from 'lucide-react';
import './FAQ.css';

const faqItems = [
  {
    icon: <ShoppingBag size={20} />,
    question: 'How do I place an order?',
    answer: 'Browse our shop, add items to your cart, fill in your delivery details, and complete payment through UPI or Razorpay. You\'ll receive a confirmation once your order is placed.',
  },
  {
    icon: <Paintbrush size={20} />,
    question: 'Can I request a custom or personalised piece?',
    answer: 'Absolutely! Visit the "Custom Gifts" page to describe your idea, choose a product type, set a delivery date, and submit your request. We\'ll personally review it and get back to you.',
  },
  {
    icon: <RotateCcw size={20} />,
    question: 'Can I edit or cancel my order after placing it?',
    answer: 'Orders can be updated or cancelled before production starts. Please reach out via WhatsApp as soon as possible after placing the order. Once "In Progress", changes may not be possible.',
  },
  {
    icon: <Truck size={20} />,
    question: 'How long does delivery take?',
    answer: 'Standard orders typically take 5–10 business days. Custom orders can take 2–3 weeks depending on complexity. You\'ll get an email once your order is shipped.',
  },
  {
    icon: <MessageCircle size={20} />,
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI payments (Google Pay, PhonePe, Paytm, etc.) and card payments via Razorpay. All transactions are secured and encrypted.',
  },
  {
    icon: <Heart size={20} />,
    question: 'Do you offer gift wrapping?',
    answer: 'Yes! Every order comes beautifully wrapped with tissue paper and a custom handwritten note. If you\'re gifting, you can add a personalised message at checkout.',
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('faq-in-view'); }),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const addRef = el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="faq-page">
      {/* Orb background */}
      <div className="faq-orb faq-orb-1" />
      <div className="faq-orb faq-orb-2" />

      <div className="container faq-inner">
        {/* Header */}
        <div className="faq-header" ref={addRef}>
          <p className="faq-eyebrow"><Sparkles size={15} /> FAQ</p>
          <h1 className="faq-title">Common Questions,<br /><span className="faq-title-accent">Answered.</span></h1>
          <p className="faq-subtitle">
            Everything you need to know about ordering, customising, and receiving your handcrafted piece.
          </p>
        </div>

        {/* Accordion */}
        <div className="faq-list">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className={`faq-item faq-reveal ${openIndex === i ? 'faq-item--open' : ''}`}
              ref={addRef}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <button
                className="faq-question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                <span className="faq-q-icon">{item.icon}</span>
                <span className="faq-q-text">{item.question}</span>
                <span className={`faq-chevron ${openIndex === i ? 'rotated' : ''}`}>
                  <ChevronDown size={20} />
                </span>
              </button>
              <div className="faq-answer-wrap" style={{ maxHeight: openIndex === i ? '300px' : '0' }}>
                <p className="faq-answer">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="faq-cta" ref={addRef}>
          <div className="faq-cta-card faq-reveal">
            <Sparkles size={36} className="faq-cta-icon" />
            <h3>Still have questions?</h3>
            <p>We're just a message away. Reach out on WhatsApp and we'll get back to you within the hour.</p>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="faq-cta-btn"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
