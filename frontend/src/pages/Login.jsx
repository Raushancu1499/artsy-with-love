import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import './Login.css';
import { Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';

const EMOJIS = ['🧸','🌸','🎀','✨','🌷','💝','🧶','🎁','🌼','💌','🌹','🎊'];

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      if (!isRegister) {
        login(data.user, data.token);
        navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true });
      } else {
        setIsRegister(false);
        setFormData({ name: '', email: '', password: '' });
        setError('success:Account created! Please sign in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(p => !p);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const isSuccess = error.startsWith('success:');
  const msg = isSuccess ? error.replace('success:', '') : error;

  return (
    <div className="lx-root">

      {/* ── LEFT: Immersive Branding Panel ── */}
      <div className="lx-brand-panel">
        <img src="/login_panel.png" className="lx-panel-img" alt="" />
        <div className="lx-panel-overlay" />

        {/* Floating emoji particles */}
        <div className="lx-particles" aria-hidden="true">
          {EMOJIS.map((e, i) => (
            <span key={i} className="lx-particle" style={{
              left: `${8 + i * 7.5}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${6 + (i % 4) * 2}s`
            }}>{e}</span>
          ))}
        </div>

        {/* Orbs */}
        <div className="lx-orb lx-orb-a" />
        <div className="lx-orb lx-orb-b" />

        {/* Brand mark */}
        <div className="lx-brand-mark">
          <div className="lx-brand-icon">💗</div>
          <span className="lx-brand-name">Artsy With Love</span>
        </div>

        {/* Hero text on panel */}
        <div className="lx-panel-copy">
          <h2 className="lx-panel-headline">
            Every piece<br />tells a story.
          </h2>
          <p className="lx-panel-sub">
            Handcrafted crochet gifts made with love, warmth, and intention.
          </p>
        </div>

        {/* Trust pills */}
        <div className="lx-trust-pills">
          <span className="lx-pill">🧸 100% Handmade</span>
          <span className="lx-pill">🎀 Gift Ready</span>
          <span className="lx-pill">✨ Custom Orders</span>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="lx-form-panel">
        {/* Soft ambient blobs */}
        <div className="lx-blob lx-blob-1" />
        <div className="lx-blob lx-blob-2" />

        <div className="lx-form-wrap" key={isRegister ? 'r' : 'l'}>
          <Link to="/" className="lx-back">← Back to shop</Link>

          {/* Toggle tabs */}
          <div className="lx-tabs">
            <button
              className={`lx-tab ${!isRegister ? 'lx-tab--active' : ''}`}
              onClick={() => isRegister && switchMode()}
            >Sign In</button>
            <button
              className={`lx-tab ${isRegister ? 'lx-tab--active' : ''}`}
              onClick={() => !isRegister && switchMode()}
            >Create Account</button>
            <div className="lx-tab-indicator" style={{ transform: isRegister ? 'translateX(100%)' : 'translateX(0)' }} />
          </div>

          {/* Heading */}
          <div className="lx-heading">
            <h1 className="lx-title">
              {isRegister ? 'Join the family ✨' : 'Welcome back 💝'}
            </h1>
            <p className="lx-subtitle">
              {isRegister
                ? 'Create your account and start your artisanal journey.'
                : 'Sign in to continue your artisanal journey.'}
            </p>
          </div>

          {/* Alert */}
          {error && (
            <div className={`lx-alert ${isSuccess ? 'lx-alert--ok' : 'lx-alert--err'}`}>
              {isSuccess ? '✓' : '⚠'} {msg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="lx-form" noValidate>

            {isRegister && (
              <div className={`lx-field ${focused === 'name' || formData.name ? 'lx-field--active' : ''}`}>
                <input
                  className="lx-input"
                  type="text"
                  name="name"
                  id="lx-name"
                  placeholder=" "
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  autoComplete="name"
                />
                <label className="lx-label" htmlFor="lx-name">Full Name</label>
                <div className="lx-field-line" />
              </div>
            )}

            <div className={`lx-field ${focused === 'email' || formData.email ? 'lx-field--active' : ''}`}>
              <input
                className="lx-input"
                type="email"
                name="email"
                id="lx-email"
                placeholder=" "
                required
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                autoComplete="email"
              />
              <label className="lx-label" htmlFor="lx-email">Email Address</label>
              <div className="lx-field-line" />
            </div>

            <div className={`lx-field ${focused === 'password' || formData.password ? 'lx-field--active' : ''}`}>
              <input
                className="lx-input"
                type={showPw ? 'text' : 'password'}
                name="password"
                id="lx-pw"
                placeholder=" "
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                style={{ paddingRight: '3rem' }}
              />
              <label className="lx-label" htmlFor="lx-pw">Password</label>
              <div className="lx-field-line" />
              <button
                type="button"
                className="lx-eye"
                onClick={() => setShowPw(p => !p)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {!isRegister && (
              <div className="lx-forgot-row">
                <button type="button" className="lx-forgot">Forgot password?</button>
              </div>
            )}

            <button type="submit" className="lx-submit" disabled={loading}>
              {loading
                ? <><Loader size={18} className="lx-spin" /> Processing</>
                : <>{isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /></>
              }
              <span className="lx-btn-shimmer" />
            </button>
          </form>

          {/* Divider */}
          <div className="lx-divider"><span>Secured by Artsy With Love</span></div>

          {/* Trust badges */}
          <div className="lx-badges">
            <div className="lx-badge-item">🔒<span>Encrypted</span></div>
            <div className="lx-badge-item">🛡️<span>Secure</span></div>
            <div className="lx-badge-item">✅<span>Trusted</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
