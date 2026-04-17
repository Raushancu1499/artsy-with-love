import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import './Admin.css';
import { LayoutDashboard, ShoppingBag, Palette, Users, Settings, TrendingUp, DollarSign, Package, UserCheck, Plus, Minus } from 'lucide-react';

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
  const [productSubTab, setProductSubTab] = useState('marketplace'); // 'marketplace' or 'add'
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State for Editing/Adding
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'fixed',
    category: 'Flowers',
    stock: 1,
    production: 'Ships in 3-5 days'
  });

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'products') fetchProducts();
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to retire this treasure? This action is permanent.")) return;
    
    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        fetchStats(); 
        alert('✨ Treasure retired successfully!');
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const handleUpdateStock = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const token = localStorage.getItem('artsy_token');
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        // Optimistically update the UI for instant gratification
        setProducts(products.map(p => p._id === id ? { ...p, stock: newStock } : p));
      }
    } catch (err) {
      console.error('Failed to update stock', err);
    }
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      type: product.type || 'fixed',
      category: product.category,
      stock: product.stock || 1,
      production: product.productionTimeline || 'Ships in 3-5 days'
    });
    setTempImageUrl(product.images?.[0] || '');
    setProductSubTab('add'); // Switch to the form view
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
    
    // Ensure we have an image link (either manual or uploaded)
    const manualImage = e.target.manualImage?.value;
    const finalImageUrl = tempImageUrl || manualImage || 'https://via.placeholder.com/600x600?text=Artsy+Product';

    const productPayload = {
      ...formData,
      category: isAddingNewCategory ? newCategoryName : formData.category,
      images: [finalImageUrl]
    };
    
    try {
      const token = localStorage.getItem('artsy_token');
      const url = isEditing 
        ? `${API_BASE_URL}/api/products/${editingProduct?._id}`
        : `${API_BASE_URL}/api/products`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productPayload)
      });
      if (res.ok) {
        alert(isEditing ? '✨ Treasure refined successfully!' : '✨ Product published successfully!');
        resetForm();
        setProductSubTab('marketplace'); // Switch back to view the list
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to process product', err);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      type: 'fixed',
      category: 'Flowers',
      stock: 1,
      production: 'Ships in 3-5 days'
    });
    setTempImageUrl('');
    setNewCategoryName('');
    setIsAddingNewCategory(false);
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
            <li><button className={`admin-nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}><Palette size={18} /> Marketplace</button></li>
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
          
          {/* --- MARKETPLACE (PRODUCTS) TAB --- */}
          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <div className="admin-header">
                <h1 className="editorial-title">Artsy Marketplace</h1>
                <div className="marketplace-subnav">
                  <button 
                    className={`subnav-btn ${productSubTab === 'marketplace' ? 'active' : ''}`}
                    onClick={() => setProductSubTab('marketplace')}
                  >
                    📦 Storefront Inventory
                  </button>
                  <button 
                    className={`subnav-btn ${productSubTab === 'add' ? 'active' : ''}`}
                    onClick={() => setProductSubTab('add')}
                  >
                    ✨ Launch New Treasure
                  </button>
                </div>
              </div>

              {productSubTab === 'marketplace' ? (
                /* CATEGORIZED MARKETPLACE LIST */
                <div className="admin-inventory-full animate-fade-in">
                  {Object.keys(products.reduce((acc, p) => {
                    const cat = p.category || 'Uncategorized';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(p);
                    return acc;
                  }, {})).length > 0 ? Object.keys(products.reduce((acc, p) => {
                    const cat = p.category || 'Uncategorized';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(p);
                    return acc;
                  }, {})).map(category => {
                    const categoryItems = products.filter(p => p.category === category);
                    return (
                      <div key={category} className="category-section">
                        <div className="category-section-header">
                          <h3 className="category-title">{category}</h3>
                          <span className="category-count">{categoryItems.length} Treasures</span>
                        </div>
                        <div className="table-container premium-card">
                          <table className="premium-table">
                            <thead>
                              <tr>
                                <th>Item Details</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Status</th>
                                <th>Controls</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryItems.map(p => (
                                <tr key={p._id}>
                                  <td className="product-table-cell">
                                    <div className="item-preview">
                                      <img src={p.images?.[0]} alt={p.name} className="table-thumb" />
                                      <div className="table-info">
                                        <span className="p-name">{p.name}</span>
                                        <span className="p-id">{p._id.slice(-6).toUpperCase()}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td><span className="pill pill-role">{p.category}</span></td>
                                  <td><span className="price-tag">₹{p.price}</span></td>
                                  <td>
                                    <div className="qty-control">
                                      <button 
                                        className="qty-btn" 
                                        onClick={() => handleUpdateStock(p._id, p.stock, -1)}
                                        disabled={p.stock === 0}
                                        title="Decrease Stock"
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className={`pill stock-pill ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {p.stock > 0 ? `${p.stock} Available` : 'Sold Out'}
                                      </span>
                                      <button 
                                        className="qty-btn" 
                                        onClick={() => handleUpdateStock(p._id, p.stock, 1)}
                                        title="Increase Stock"
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  </td>
                                  <td style={{ minWidth: '150px' }}>
                                    <button 
                                      onClick={() => handleEditProduct(p)}
                                      className="icon-btn edit-btn"
                                      style={{ background: '#fbbf24', color: '#000', padding: '6px 12px', fontSize: '0.8rem', marginRight: '8px' }}
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteProduct(p._id)}
                                      className="icon-btn delete-btn"
                                      style={{ background: '#fee2e2', color: '#111', padding: '6px 12px', fontSize: '0.8rem' }}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="empty-marketplace">
                      {loading ? 'Consulting the archive...' : 'The marketplace is currently empty.'}
                    </div>
                  )}
                </div>
              ) : (
                /* FULL WIDTH ADD/EDIT PRODUCT FORM */
                <div className="admin-form-full animate-fade-in">
                  <div className="admin-form-container glass-card full-form">
                    <div className="form-header">
                      <h3>{isEditing ? 'Refinement Portal' : 'Creation Portal'}</h3>
                      <p>{isEditing ? `You are refining "${editingProduct?.name}".` : 'Describe your new artisanal treasure to the world.'}</p>
                    </div>
                    <form onSubmit={handleAddProduct} className="admin-form">
                      <div className="form-grid-three">
                        <div className="form-group">
                          <label className="metric-label">Product Name</label>
                          <input 
                            name="name" 
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="e.g. Velvet Sleepy Bunny" 
                            required 
                            className="admin-input" 
                          />
                        </div>
                        <div className="form-group">
                          <label className="metric-label">Price (₹)</label>
                          <input 
                            name="price" 
                            type="number" 
                            value={formData.price}
                            onChange={handleFormChange}
                            placeholder="0" 
                            className="admin-input" 
                          />
                        </div>
                        <div className="form-group">
                          <label className="metric-label">Product Type</label>
                          <select 
                            name="type" 
                            value={formData.type}
                            onChange={handleFormChange}
                            className="admin-input"
                          >
                            <option value="fixed">Fixed Price</option>
                            <option value="custom">Custom Quote</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                            <label className="metric-label">Category</label>
                            {!isEditing && (
                              <button 
                                type="button" 
                                className="btn-link" 
                                style={{fontSize: '0.7rem'}}
                                onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                              >
                                {isAddingNewCategory ? '← Back to list' : '+ Add New'}
                              </button>
                            )}
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
                            <select 
                              name="category" 
                              value={formData.category}
                              onChange={handleFormChange}
                              className="admin-input" 
                              required
                              disabled={isEditing}
                            >
                              <option value="Flowers">Flowers</option>
                              <option value="Soft Toys">Soft Toys</option>
                              <option value="Keychains">Keychains</option>
                              <option value="Combos">Combos</option>
                            </select>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="metric-label">Quantity in Stock</label>
                          <input 
                            name="stock" 
                            type="number" 
                            value={formData.stock}
                            onChange={handleFormChange}
                            min="0" 
                            className="admin-input" 
                          />
                        </div>
                        <div className="form-group">
                          <label className="metric-label">Production Info</label>
                          <input 
                            name="production" 
                            value={formData.production}
                            onChange={handleFormChange}
                            placeholder="Ships in 3-5 days" 
                            className="admin-input" 
                          />
                        </div>
                        
                        <div className="form-group" style={{gridColumn: 'span 3'}}>
                          <label className="metric-label">Artisan Visuals</label>
                          <div className="upload-preview-container">
                            {tempImageUrl ? (
                              <div className="upload-preview full-preview">
                                <img src={tempImageUrl} alt="Preview" />
                                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                                  <button type="button" className="btn-link" onClick={() => setTempImageUrl('')}>Replace Photo</button>
                                </div>
                              </div>
                            ) : (
                              <div className="upload-box full-box">
                                <input 
                                  type="file" 
                                  id="product-photo" 
                                  accept="image/*" 
                                  onChange={handleImageUpload} 
                                  style={{display: 'none'}} 
                                />
                                <label htmlFor="product-photo" className="upload-label">
                                  {isUploading ? '📤 Consulting the Cloud...' : '📸 Choose from Gallery or Files'}
                                </label>
                                <div style={{marginTop: '0.8rem', fontSize: '0.7rem', color: '#999'}}>
                                  Or paste a public link: 
                                  <input name="manualImage" placeholder="https://..." className="admin-input-mini" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="form-group" style={{gridColumn: 'span 3'}}>
                          <label className="metric-label">Product Story / Description</label>
                          <textarea 
                            name="description" 
                            value={formData.description}
                            onChange={handleFormChange}
                            placeholder="The heart and soul of your product..." 
                            required 
                            className="admin-input" 
                            style={{height: '100px'}}
                          ></textarea>
                        </div>
                      </div>
                      <div className="form-footer" style={{gap: '2rem'}}>
                        {isEditing && (
                          <button type="button" className="btn btn-secondary" onClick={resetForm}>
                            Cancel Refinement
                          </button>
                        )}
                        <button type="submit" disabled={isUploading} className="btn btn-primary auth-btn" style={{padding: '1rem 3rem', opacity: isUploading ? 0.7 : 1}}>
                          {isUploading ? 'Preparing Post...' : (isEditing ? 'Save Refined Treasure' : 'Publish to Marketplace')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
