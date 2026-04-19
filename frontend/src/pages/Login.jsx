import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import './Login.css';
import { Eye, EyeOff, Heart, ArrowRight, Loader } from 'lucide-react';

const FLOATING_ITEMS = ['🧸', '🌸', '🎀', '✨', '🌷', '💝', '🧶', '🎁', '🌼', '💌'];

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Floating emoji particles */}
      <div className="floating-particles" aria-hidden="true">
        {FLOATING_ITEMS.map((emoji, i) => (
          <span key={i} className={`particle particle-${i + 1}`}>{emoji}</span>
        ))}
      </div>

      {/* Main glass card */}
      <div className={`login-glass-card ${isRegister ? 'mode-register' : 'mode-login'}`}>
        {/* Brand mark */}
        <div className="login-brand">
          <Heart size={20} className="login-brand-icon" fill="currentColor" />
          <Link to="/" className="login-brand-name">Artsy With Love</Link>
        </div>

        {/* Heading with slide animation */}
        <div className="login-heading" key={isRegister ? 'reg' : 'log'}>
          <h1 className="login-title">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="login-subtitle">
            {isRegister
              ? 'Join a community that celebrates handmade artistry.'
              : 'Sign in to continue your artisanal journey.'}
          </p>
        </div>

        {/* Status message */}
        {error && (
          <div className={`login-message ${isSuccess ? 'login-message-success' : 'login-message-error'}`}>
            <span>{isSuccess ? '✓' : '!'}</span>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {isRegister && (
            <div className={`login-field ${focused === 'name' || formData.name ? 'active' : ''}`}>
              <input
                type="text"
                name="name"
                id="login-name"
                required
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
                autoComplete="name"
              />
              <label htmlFor="login-name">Full Name</label>
              <div className="field-line" />
            </div>
          )}

          <div className={`login-field ${focused === 'email' || formData.email ? 'active' : ''}`}>
            <input
              type="email"
              name="email"
              id="login-email"
              required
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              autoComplete="email"
            />
            <label htmlFor="login-email">Email Address</label>
            <div className="field-line" />
          </div>

          <div className={`login-field ${focused === 'password' || formData.password ? 'active' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="login-password"
              required
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            <label htmlFor="login-password">Password</label>
            <div className="field-line" />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <Loader size={18} className="spin-icon" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Mode switcher */}
        <div className="login-switch">
          <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
          <button type="button" onClick={switchMode} className="login-switch-btn">
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Decorative footer */}
        <div className="login-footer-text">
          Handcrafted with 🧶 & love
        </div>
      </div>
    </div>
  );
}

export default Login;
