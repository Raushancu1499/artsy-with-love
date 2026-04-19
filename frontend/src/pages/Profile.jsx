import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import { User, Mail, Phone, Edit2, Check, X, Moon, Sun, Shield } from 'lucide-react';
import './Profile.css';

function Profile() {
  const { user, login } = useAuth(); // login is actually used to update context in some impls, but we'll fetch
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); // 'name', 'email', 'phone'
  const [editValue, setEditValue] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field, currentValue) => {
    setIsEditing(field);
    setEditValue(currentValue || '');
  };

  const handleSave = async (field) => {
    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: editValue })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setIsEditing(null);
        setMessage({ type: 'success', text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (loading) return <div className="profile-loading">Loading your profile...</div>;

  return (
    <div className="profile-page animate-fade-in">
      <div className="container">
        <div className="profile-container">
          <div className="profile-card premium-card">
            <div className="profile-header">
              <div className="user-avatar">
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="header-text">
                <h1>{profile?.name}</h1>
                <p className="role-badge">{profile?.role || 'Customer'}</p>
              </div>
            </div>

            {message.text && (
              <div className={`profile-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="profile-sections">
              {/* Name Section */}
              <div className="info-row">
                <div className="info-label">
                  <User size={18} />
                  <span>Full Name</span>
                </div>
                <div className="info-content">
                  {isEditing === 'name' ? (
                    <div className="edit-group">
                      <input 
                        type="text" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <button className="save-btn" onClick={() => handleSave('name')}><Check size={18} /></button>
                      <button className="cancel-btn" onClick={() => setIsEditing(null)}><X size={18} /></button>
                    </div>
                  ) : (
                    <>
                      <span className="info-value">{profile?.name}</span>
                      <button className="edit-icon-btn" onClick={() => handleEdit('name', profile?.name)}>
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Email Section */}
              <div className="info-row">
                <div className="info-label">
                  <Mail size={18} />
                  <span>Email Address</span>
                </div>
                <div className="info-content">
                  {isEditing === 'email' ? (
                    <div className="edit-group">
                      <input 
                        type="email" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <button className="save-btn" onClick={() => handleSave('email')}><Check size={18} /></button>
                      <button className="cancel-btn" onClick={() => setIsEditing(null)}><X size={18} /></button>
                    </div>
                  ) : (
                    <>
                      <span className="info-value">{profile?.email}</span>
                      <button className="edit-icon-btn" onClick={() => handleEdit('email', profile?.email)}>
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Phone Section */}
              <div className="info-row">
                <div className="info-label">
                  <Phone size={18} />
                  <span>Phone Number</span>
                </div>
                <div className="info-content">
                  {isEditing === 'phone' ? (
                    <div className="edit-group">
                      <input 
                        type="tel" 
                        value={editValue} 
                        placeholder="Add phone number"
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <button className="save-btn" onClick={() => handleSave('phone')}><Check size={18} /></button>
                      <button className="cancel-btn" onClick={() => setIsEditing(null)}><X size={18} /></button>
                    </div>
                  ) : (
                    <>
                      <span className="info-value">{profile?.phone || 'Not added yet'}</span>
                      <button className="edit-icon-btn" onClick={() => handleEdit('phone', profile?.phone)}>
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {profile?.role === 'admin' && (
                <div className="info-row security">
                  <div className="info-label">
                    <Shield size={18} />
                    <span>Account Type</span>
                  </div>
                  <div className="info-content">
                    <span className="info-value admin-tag">Administrator Access</span>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-footer">
              <h3>Appearance</h3>
              <p>Customize how the boutique looks for you.</p>
              <div className="theme-selector">
                <button 
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => theme !== 'light' && toggleTheme()}
                >
                  <Sun size={20} />
                  <span>Light Mode</span>
                </button>
                <button 
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => theme !== 'dark' && toggleTheme()}
                >
                  <Moon size={20} />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
