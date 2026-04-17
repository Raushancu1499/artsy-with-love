import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import './Login.css';
import loginHero from '../assets/login-hero.png';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (!isRegister) {
        login(data.user, data.token);
        navigate(from, { replace: true });
      } else {
        setIsRegister(false);
        setError('Success! Your account is ready. Please login.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-split">
        {/* Left Side: Editorial Image */}
        <div className="login-hero-section">
          <img src={loginHero} alt="Artsy Editorial" className="login-hero-img" />
          <div className="login-hero-overlay">
            <div className="hero-content">
              <span className="hero-tag">Handmade with Love</span>
              <h2>A world of artisanal wonder awaits.</h2>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-section">
          <div className="login-card glass-card">
            <h1>{isRegister ? 'Join the Circle' : 'Welcome Back'}</h1>
            <p className="subtitle">
              {isRegister ? 'Create your account to start your journey.' : 'Signin to manage your artisanal collection.'}
            </p>

            {error && <div className={`auth-message ${error.includes('Success') ? 'success' : 'error'}`}>{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {isRegister && (
                <div className="form-group floating">
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder=" "
                  />
                  <label>Full Name</label>
                </div>
              )}
              <div className="form-group floating">
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label>Email Address</label>
              </div>
              <div className="form-group floating">
                <input 
                  type="password" 
                  name="password" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label>Password</label>
              </div>

              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                {loading ? 'Finalizing...' : (isRegister ? 'Begin My Journey' : 'Step Inside')}
              </button>
            </form>

            <p className="toggle-auth">
              {isRegister ? 'Already a member?' : "New to Artsy With Love?"}
              <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Sign In' : 'Create an Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
