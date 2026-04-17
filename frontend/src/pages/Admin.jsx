import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import './Admin.css';
import { LayoutDashboard, ShoppingBag, Palette, Users, Settings, TrendingUp, DollarSign, Package, UserCheck } from 'lucide-react';

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'customers') fetchCustomers();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    // ... same logic for product creation
    const newProduct = {
      name: form.name.value,
      description: form.description.value,
      price: Number(form.price.value),
      type: form.type.value,
      category: isAddingNewCategory ? newCategoryName : form.category.value,
      images: [form.image.value || 'https://via.placeholder.com/600x600?text=Artsy+Product']
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
        setNewCategoryName('');
        setIsAddingNewCategory(false);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to add product', err);
    }
  };

  return (
    <div className="admin-page">
      <div className="container admin-container">
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
          {/* --- DASHBOARD TAB --- */}
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

          {/* --- ORDERS TAB --- */}
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
            <div>
              <div className="admin-header">
                <h1>Inventory</h1>
              </div>
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
                    <textarea name="description" placeholder="Product Story / Description" required className="admin-input" style={{gridColumn: 'span 2'}}></textarea>
                    <input name="image" placeholder="Image URL" className="admin-input" style={{gridColumn: 'span 2'}} />
                  </div>
                  <button type="submit" className="btn btn-primary auth-btn" style={{marginTop: '1rem'}}>Publish to Shop</button>
                </form>
              </div>
            </div>
          )}

          {/* --- CUSTOMERS TAB --- */}
          {activeTab === 'customers' && (
            <div className="customers-view animate-fade-in">
              <div className="admin-header">
                <h1 className="editorial-title">Clientele</h1>
                <p>Management of your registered customer base.</p>
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
