import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import './Login.css';
import { Eye, EyeOff, Heart, ArrowRight, Loader, Sparkles, Star } from 'lucide-react';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      if (!isRegister) {
        login(data.user, data.token);
        if (data.user.role === 'admin') navigate('/admin', { replace: true });
        else navigate(from, { replace: true });
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
    setIsRegister(!isRegister);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const isSuccess = error.startsWith('success:');
  const errorMsg = isSuccess ? error.replace('success:', '') : error;

  return (
    <div className="lp-root">
      {/* ── LEFT PANEL: Visual ── */}
      <div className="lp-visual">
        <img src="/login_panel.png" alt="Handmade crochet gifts" className="lp-visual-img" />
        <div className="lp-visual-overlay" />

        {/* Floating badges on photo */}
        <div className="lp-badge lp-badge-1">
          <Star size={14} fill="currentColor" /> 100% Handcrafted
        </div>
        <div className="lp-badge lp-badge-2">
          <Heart size={14} fill="currentColor" /> Made with Love
        </div>
        <div className="lp-badge lp-badge-3">
          <Sparkles size={14} /> Custom Gifting
        </div>

        {/* Brand on photo */}
        <div className="lp-visual-brand">
          <Heart size={28} fill="currentColor" className="lp-visual-brand-icon" />
          <span>Artsy With Love</span>
        </div>

        <p className="lp-visual-tagline">
          "Where every stitch carries a story worth gifting."
        </p>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="lp-form-panel">
        {/* Subtle floating blobs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />

        <div className="lp-form-wrap" key={isRegister ? 'reg' : 'log'}>
          {/* Header */}
          <Link to="/" className="lp-back-link">← Back to Shop</Link>

          <div className="lp-heading">
            <div className="lp-mode-pill">
              <button
                type="button"
                className={`lp-mode-btn ${!isRegister ? 'active' : ''}`}
                onClick={() => { if (isRegister) switchMode(); }}
              >Sign In</button>
              <button
                type="button"
                className={`lp-mode-btn ${isRegister ? 'active' : ''}`}
                onClick={() => { if (!isRegister) switchMode(); }}
              >Register</button>
            </div>

            <h1 className="lp-title">
              {isRegister ? 'Create your account ✨' : 'Welcome back 💝'}
            </h1>
            <p className="lp-subtitle">
              {isRegister
                ? 'Join a community that celebrates handmade artistry.'
                : 'Sign in to continue your artisanal journey.'}
            </p>
          </div>

          {/* Status message */}
          {error && (
            <div className={`lp-alert ${isSuccess ? 'lp-alert-success' : 'lp-alert-error'}`}>
              <span>{isSuccess ? '✓' : '⚠'}</span> {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="lp-form" noValidate>
            {isRegister && (
              <div className="lp-field-group">
                <label className="lp-label" htmlFor="lp-name">Full Name</label>
                <input
                  className="lp-input"
                  type="text"
                  name="name"
                  id="lp-name"
                  placeholder="e.g. Raushan Kumar"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="lp-field-group">
              <label className="lp-label" htmlFor="lp-email">Email Address</label>
              <input
                className="lp-input"
                type="email"
                name="email"
                id="lp-email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="lp-field-group">
              <div className="lp-label-row">
                <label className="lp-label" htmlFor="lp-password">Password</label>
                {!isRegister && <button type="button" className="lp-forgot">Forgot password?</button>}
              </div>
              <div className="lp-input-wrap">
                <input
                  className="lp-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="lp-password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="lp-pw-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-submit" disabled={loading}>
              {loading
                ? <><Loader size={18} className="lp-spin" /> Processing...</>
                : <>{isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="lp-divider"><span>or</span></div>

          {/* Trust badges */}
          <div className="lp-trust">
            <span>🔒 Secure Login</span>
            <span>🧸 100+ Happy Customers</span>
            <span>💌 Artisan Verified</span>
          </div>

          {/* Footer */}
          <p className="lp-footer-note">
            Handcrafted with 🧶 &amp; love · <Link to="/about">Our Story</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
