import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import './Admin.css';
import { LayoutDashboard, ShoppingBag, Palette, Users, Settings, TrendingUp, DollarSign, Package, UserCheck } from 'lucide-react';

function Admin() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'products') fetchProducts();
  }, [activeTab]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setTempImageUrl(data.secure_url);
        alert('✨ Photo captured and uploaded successfully!');
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('❌ Upload failed. Please check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Ensure we have an image link (either manual or uploaded)
    const finalImageUrl = tempImageUrl || form.manualImage.value || 'https://via.placeholder.com/600x600?text=Artsy+Product';

    const newProduct = {
      name: form.name.value,
      description: form.description.value,
      price: Number(form.price.value),
      type: form.type.value,
      category: isAddingNewCategory ? newCategoryName : form.category.value,
      images: [finalImageUrl]
    };
    
    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        alert('Product published successfully!');
        form.reset();
        setTempImageUrl('');
        setNewCategoryName('');
        setIsAddingNewCategory(false);
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to add product', err);
    }
  };

  return (
    <div className="admin-page">
      {/* ... previous content ... */}
      <div className="container admin-container">
        {/* ... sidebar ... */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h2 className="brand-accent">Artsy Panel</h2>
            <p>Admin Command</p>
          </div>
          <ul className="admin-nav">
            <li><button className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={18} /> Dashboard</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><ShoppingBag size={18} /> Orders</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}><Palette size={18} /> Products</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><Users size={18} /> Customers</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Settings</button></li>
          </ul>
        </aside>

        <main className="admin-content">
          {/* ... dashboard and orders tabs (same as before) ... */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-view animate-fade-in">
              <div className="admin-header">
                <h1 className="editorial-title">Business Insights</h1>
                <p>Real-time analytics for Artsy With Love.</p>
              </div>
              
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon rev"><DollarSign size={24} /></div>
                  <div className="metric-info">
                    <span className="metric-label">Total Revenue</span>
                    <h3 className="metric-value">₹{stats.revenue}</h3>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon ord"><ShoppingBag size={24} /></div>
                  <div className="metric-info">
                    <span className="metric-label">Active Orders</span>
                    <h3 className="metric-value">{stats.orders}</h3>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon prd"><Package size={24} /></div>
                  <div className="metric-info">
                    <span className="metric-label">Total Products</span>
                    <h3 className="metric-value">{stats.products}</h3>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon usr"><UserCheck size={24} /></div>
                  <div className="metric-info">
                    <span className="metric-label">Registered Users</span>
                    <h3 className="metric-value">{stats.users}</h3>
                  </div>
                </div>
              </div>

              <div className="admin-card-row">
                <div className="admin-subcard">
                  <h3>Recent Activity</h3>
                  <div className="activity-placeholder">
                    <TrendingUp size={48} color="#eee" />
                    <p>Analytics integration coming soon.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-view animate-fade-in">
              <div className="admin-header">
                <h1 className="editorial-title">Order Management</h1>
                <div className="admin-actions">
                  <select className="admin-select">
                    <option>All Statuses</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="table-container premium-card">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#ORD-1001</td>
                      <td>Jane Doe</td>
                      <td><span className="pill pill-role">Fixed</span></td>
                      <td><span className="pill pill-status pending">Pending</span></td>
                      <td>₹999</td>
                      <td><button className="btn-link">Process</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* --- PRODUCTS TAB --- */}
          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <div className="admin-header">
                <h1 className="editorial-title">Inventory Control</h1>
                <p>Manage your artisanal collections and availability.</p>
              </div>

              <div className="admin-grid-layout" style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', alignItems: 'start'}}>
                <div className="admin-form-container glass-card">
                  <h3>Add New Product</h3>
                  <form onSubmit={handleAddProduct} className="admin-form">
                    <div className="form-grid">
                      <input name="name" placeholder="Product Name" required className="admin-input" />
                      <input name="price" type="number" placeholder="Price (₹)" className="admin-input" />
                      <select name="type" className="admin-input">
                        <option value="fixed">Fixed Price</option>
                        <option value="custom">Custom Quote</option>
                      </select>
                      <div className="form-group">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                          <label className="metric-label">Category</label>
                          <button 
                            type="button" 
                            className="btn-link" 
                            style={{fontSize: '0.7rem'}}
                            onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                          >
                            {isAddingNewCategory ? '← Back to list' : '+ Add New'}
                          </button>
                        </div>
                        {isAddingNewCategory ? (
                          <input 
                            type="text" 
                            name="customCategory"
                            className="admin-input" 
                            placeholder="e.g. Wall Hangings"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                          />
                        ) : (
                          <select name="category" className="admin-input" required>
                            <option value="Flowers">Flowers</option>
                            <option value="Soft Toys">Soft Toys</option>
                            <option value="Keychains">Keychains</option>
                            <option value="Combos">Combos</option>
                          </select>
                        )}
                      </div>
                      
                      {/* NEW: IMAGE UPLOAD SECTION */}
                      <div className="form-group" style={{gridColumn: 'span 2'}}>
                        <label className="metric-label">Product Visuals</label>
                        <div className="upload-preview-container">
                          {tempImageUrl ? (
                            <div className="upload-preview">
                              <img src={tempImageUrl} alt="Preview" />
                              <button type="button" className="btn-link" onClick={() => setTempImageUrl('')}>Replace Photo</button>
                            </div>
                          ) : (
                            <div className="upload-box">
                              <input 
                                type="file" 
                                id="product-photo" 
                                accept="image/*" 
                                capture="environment"
                                onChange={handleImageUpload} 
                                style={{display: 'none'}} 
                              />
                              <label htmlFor="product-photo" className="upload-label">
                                {isUploading ? '📤 Consulting the Cloud...' : '📸 Snap or Choice Photo'}
                              </label>
                              <div style={{marginTop: '0.8rem', fontSize: '0.7rem', color: '#999'}}>
                                Or paste a link: 
                                <input name="manualImage" placeholder="https://..." className="admin-input-mini" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <textarea name="description" placeholder="Product Story / Description" required className="admin-input" style={{gridColumn: 'span 2'}}></textarea>
                    </div>
                    <button type="submit" disabled={isUploading} className="btn btn-primary auth-btn" style={{marginTop: '1rem', opacity: isUploading ? 0.7 : 1}}>
                      {isUploading ? 'Preparing Post...' : 'Publish to Shop'}
                    </button>
                  </form>
                </div>

                {/* Existing Products List */}
                <div className="admin-inventory-list">
                  <div className="table-container premium-card">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length > 0 ? products.map(p => (
                          <tr key={p._id}>
                            <td className="product-table-cell">
                              <img src={p.images?.[0]} alt={p.name} className="table-thumb" />
                              <div className="table-info">
                                <span className="p-name">{p.name}</span>
                                <span className="p-id">{p._id.slice(-6).toUpperCase()}</span>
                              </div>
                            </td>
                            <td>{p.category}</td>
                            <td>₹{p.price}</td>
                            <td>
                              <button 
                                onClick={() => handleDeleteProduct(p._id)}
                                className="icon-btn delete-btn"
                                title="Delete Product"
                                style={{color: '#ff4d4d'}}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" style={{textAlign: 'center', padding: '3rem'}}>
                              {loading ? 'Consulting the archive...' : 'No treasures in stock.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- CUSTOMERS TAB --- */}
          {activeTab === 'customers' && (
            <div className="customers-view animate-fade-in">
              <div className="admin-header">
                <h1 className="editorial-title">Customers</h1>
                <p>Manage and view your registered community.</p>
              </div>
              
              <div className="table-container premium-card">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Account Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? customers.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className="pill pill-role">{user.role}</span></td>
                        <td><span className="pill pill-status active">Active</span></td>
                        <td><button className="btn-link">View Orders</button></td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '3rem'}}>
                          {loading ? 'Fetching customers...' : 'No customers registered yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
            <div className="settings-view">
              <div className="admin-header">
                <h1>Platform Settings</h1>
                <p>Configure your boutique's global parameters.</p>
              </div>
              
              <div className="admin-form-container glass-card">
                <form className="admin-form">
                  <div className="form-section">
                    <h4>General Information</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Boutique Name</label>
                        <input type="text" defaultValue="Artsy With Love" className="admin-input" />
                      </div>
                      <div className="form-group">
                        <label>Support Email</label>
                        <input type="email" defaultValue="hello@artsy.com" className="admin-input" />
                      </div>
                    </div>
                  </div>

                  <div className="form-section" style={{marginTop: '2rem'}}>
                    <h4>Integrations Status</h4>
                    <div className="status-list">
                      <div className="status-item">
                        <span>Razorpay Payments</span>
                        <span className="status-badge status-progress">Test Mode</span>
                      </div>
                      <div className="status-item">
                        <span>Cloudinary Storage</span>
                        <span className="status-badge status-progress">Active</span>
                      </div>
                    </div>
                  </div>

                  <button type="button" className="btn btn-primary" style={{marginTop: '2rem'}}>Save Configuration</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;
