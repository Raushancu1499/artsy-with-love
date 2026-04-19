import { useCallback, useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';
import './Admin.css';
import {
  LayoutDashboard,
  ShoppingBag,
  Palette,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Package,
  UserCheck,
  Plus,
  Minus,
  X
} from 'lucide-react';

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '',
  type: 'fixed',
  category: 'Flowers',
  stock: 1,
  production: 'Ships in 3-5 days',
};

const formatOrderDate = (value) => {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date);
};

function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState(null); // To filter orders by specific user
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [productSubTab, setProductSubTab] = useState('marketplace');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const getToken = () => localStorage.getItem('artsy_token');

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch customers', error);
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
      fetchOrders();
      fetchProducts();
    }
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'products') fetchProducts();
  }, [activeTab, fetchCustomers, fetchOrders, fetchProducts, fetchStats]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to retire this product? This action is permanent.')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((product) => product._id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  const handleUpdateStock = async (id, currentStock, delta) => {
    const newStock = Math.max(0, Number(currentStock || 0) + delta);

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (res.ok) {
        setProducts((prev) => prev.map((product) => (
          product._id === id ? { ...product, stock: newStock } : product
        )));
      }
    } catch (error) {
      console.error('Failed to update stock', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) => prev.map((order) => (
          order._id === orderId ? { ...order, status: newStatus } : order
        )));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (res.ok) {
        setOrders((prev) => prev.map((order) => (
          order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        )));
      }
    } catch (error) {
      console.error('Failed to update payment status', error);
    }
  };

  const handleViewUserOrders = (customer) => {
    setCustomerFilter(customer);
    setOrderStatusFilter('all');
    setActiveTab('orders');
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setEditingProduct(product);
    setProductSubTab('add');
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setTempImageUrl(product.images?.[0] || '');
    setManualImageUrl(product.images?.[0] || '');
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      type: product.type || 'fixed',
      category: product.category || 'Flowers',
      stock: product.stock ?? 1,
      production: product.productionTimeline || 'Ships in 3-5 days',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const payload = new FormData();
    payload.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: payload,
      });
      const data = await res.json();

      if (data.secure_url) {
        setTempImageUrl(data.secure_url);
        setManualImageUrl(data.secure_url);
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
    setTempImageUrl('');
    setManualImageUrl('');
    setNewCategoryName('');
    setIsAddingNewCategory(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const chosenCategory = isAddingNewCategory ? newCategoryName.trim() : formData.category;
    const finalImageUrl = tempImageUrl || manualImageUrl || 'https://via.placeholder.com/600x600?text=Artsy+Product';

    const productPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      category: chosenCategory,
      stock: Number(formData.stock) || 0,
      productionTimeline: formData.production.trim(),
      images: [finalImageUrl],
      price: formData.type === 'custom' ? undefined : Number(formData.price) || 0,
    };

    try {
      const url = isEditing
        ? `${API_BASE_URL}/api/products/${editingProduct?._id}`
        : `${API_BASE_URL}/api/products`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(productPayload),
      });

      if (res.ok) {
        resetForm();
        setProductSubTab('marketplace');
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderStatusFilter === 'all' ? true : order.status === orderStatusFilter;
    const matchesCustomer = customerFilter ? (order.userId?._id === customerFilter._id || order.customerDetails?.email === customerFilter.email) : true;
    return matchesStatus && matchesCustomer;
  });

  const totalOrders = orders.length;
  const totalRevenue = Number(stats.revenue || 0);
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
  const activeOrders = orders.filter((order) => ['pending', 'in progress', 'ready', 'shipped'].includes(order.status)).length;
  const customOrders = orders.filter((order) => order.items?.some((item) => {
    const product = item.productId;
    return !product || (typeof product === 'object' && product.type === 'custom');
  })).length;
  const averageOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const fulfillmentRate = totalOrders ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const lowStockProducts = [...products]
    .filter((product) => Number(product.stock || 0) <= 3)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
    .slice(0, 4);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);
  const orderStatusSummary = [
    {
      label: 'Pending',
      count: orders.filter((order) => order.status === 'pending').length,
      tone: 'gold',
    },
    {
      label: 'In Progress',
      count: orders.filter((order) => order.status === 'in progress').length,
      tone: 'blue',
    },
    {
      label: 'Ready',
      count: orders.filter((order) => order.status === 'ready').length,
      tone: 'violet',
    },
    {
      label: 'Delivered',
      count: deliveredOrders,
      tone: 'green',
    },
  ];
  const categoryInsights = Object.entries(groupedProducts)
    .map(([name, categoryProducts]) => ({
      name,
      count: categoryProducts.length,
      share: products.length ? Math.round((categoryProducts.length / products.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const dashboardHighlights = [
    {
      label: 'Average Order Value',
      value: `Rs. ${averageOrderValue}`,
      note: totalOrders ? 'Calculated from live order totals' : 'Will appear after the first paid order',
      Icon: DollarSign,
    },
    {
      label: 'Custom Requests',
      value: customOrders,
      note: customOrders ? 'Quote-based orders need attention' : 'No custom requests right now',
      Icon: Palette,
    },
    {
      label: 'Fulfilment Rate',
      value: `${fulfillmentRate}%`,
      note: deliveredOrders ? `${deliveredOrders} completed deliveries` : 'No completed deliveries yet',
      Icon: TrendingUp,
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockProducts.length,
      note: lowStockProducts.length ? 'Restock these products soon' : 'Inventory health looks strong',
      Icon: Package,
    },
  ];

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
            <li><button className={`admin-nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}><Palette size={18} /> Marketplace</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><Users size={18} /> Customers</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Settings</button></li>
          </ul>
        </aside>

        <main className="admin-content">
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
                    <h3 className="metric-value">Rs. {stats.revenue || 0}</h3>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon ord"><ShoppingBag size={24} /></div>
                  <div className="metric-info">
                    <span className="metric-label">Active Orders</span>
                    <h3 className="metric-value">{stats.orders || 0}</h3>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon prd"><Package size={24} /></div>
                  <div className="metric-info">
                    <span className="metric-label">Total Products</span>
                    <h3 className="metric-value">{stats.products || 0}</h3>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon usr"><UserCheck size={24} /></div>
                  <div className="metric-info">
                    <span className="metric-label">Registered Users</span>
                    <h3 className="metric-value">{stats.users || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="insight-grid">
                {dashboardHighlights.map(({ label, value, note, Icon }) => {
                  const InsightIcon = Icon;

                  return (
                    <div key={label} className="insight-card">
                      <div className="insight-icon">
                        <InsightIcon size={18} />
                      </div>
                      <span className="metric-label">{label}</span>
                      <strong className="insight-value">{value}</strong>
                      <p className="insight-note">{note}</p>
                    </div>
                  );
                })}
              </div>

              <div className="admin-card-row analytics-grid">
                <div className="admin-subcard">
                  <div className="analytics-card-header">
                    <div>
                      <span className="analytics-kicker">Order Pulse</span>
                      <h3>Fulfilment breakdown</h3>
                    </div>
                    <strong>{totalOrders} orders</strong>
                  </div>

                  <div className="status-breakdown">
                    {orderStatusSummary.map((status) => {
                      const width = totalOrders ? Math.max(10, Math.round((status.count / totalOrders) * 100)) : 0;
                      return (
                        <div key={status.label} className="status-breakdown-row">
                          <div className="status-breakdown-meta">
                            <span>{status.label}</span>
                            <strong>{status.count}</strong>
                          </div>
                          <div className="progress-track">
                            <span
                              className={`progress-fill ${status.tone}`}
                              style={{ width: width ? `${width}%` : '0%' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-subcard">
                  <div className="analytics-card-header">
                    <div>
                      <span className="analytics-kicker">Category Mix</span>
                      <h3>Marketplace demand view</h3>
                    </div>
                    <strong>{products.length} listed</strong>
                  </div>

                  {categoryInsights.length > 0 ? (
                    <div className="status-breakdown">
                      {categoryInsights.map((category) => (
                        <div key={category.name} className="status-breakdown-row">
                          <div className="status-breakdown-meta">
                            <span>{category.name}</span>
                            <strong>{category.count} items</strong>
                          </div>
                          <div className="progress-track">
                            <span
                              className="progress-fill dark"
                              style={{ width: `${Math.max(14, category.share)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="analytics-empty">Add products to see which categories are leading the storefront.</p>
                  )}
                </div>
              </div>

              <div className="admin-card-row analytics-grid">
                <div className="admin-subcard">
                  <div className="analytics-card-header">
                    <div>
                      <span className="analytics-kicker">Recent Activity</span>
                      <h3>Latest store movement</h3>
                    </div>
                    <strong>{activeOrders} active</strong>
                  </div>

                  {recentOrders.length > 0 ? (
                    <div className="activity-list">
                      {recentOrders.map((order) => (
                        <div key={order._id} className="activity-item">
                          <div className="activity-marker" />
                          <div className="activity-content">
                            <strong>{order.customerDetails?.name || 'Guest customer'} placed an order</strong>
                            <p>
                              {order.items?.length || 0} item(s) • {order.paymentStatus || 'pending'} payment • {order.status || 'pending'}
                            </p>
                          </div>
                          <span className="activity-date">{formatOrderDate(order.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="analytics-empty">Orders will appear here the moment customers begin checkout.</p>
                  )}
                </div>

                <div className="admin-subcard">
                  <div className="analytics-card-header">
                    <div>
                      <span className="analytics-kicker">Inventory Watch</span>
                      <h3>Products that need attention</h3>
                    </div>
                    <strong>{lowStockProducts.length} alerts</strong>
                  </div>

                  {lowStockProducts.length > 0 ? (
                    <div className="inventory-watch-list">
                          {lowStockProducts.map((product) => (
                        <div key={product._id} className="inventory-watch-item">
                          <div>
                            <strong>{product.name}</strong>
                            <p>{product.category}</p>
                          </div>
                          <span className={`pill stock-pill ${Number(product.stock || 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {Number(product.stock || 0)} left
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="analytics-empty">Everything is comfortably stocked right now.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-view animate-fade-in">
              <div className="admin-header">
                <h1 className="editorial-title">Order Management</h1>
                {customerFilter && (
                  <div className="filter-pill-container animate-fade-in" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    <span className="pill pill-role" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary-light)', color: 'var(--primary-dark)', border: '1px solid var(--secondary)', width: 'fit-content' }}>
                      Viewing orders for {customerFilter.name}
                      <button 
                        type="button" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0 0.2rem', display: 'flex', alignItems: 'center' }}
                        onClick={() => setCustomerFilter(null)}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  </div>
                )}
                <div className="admin-actions">
                  <select
                    className="admin-select"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
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
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                      const isCustom = order.items?.some((item) => {
                        const product = item.productId;
                        return product && typeof product === 'object' && product.type === 'custom';
                      });
                      const statusClass = String(order.status || 'pending').replace(/\s+/g, '-');

                      return (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-6).toUpperCase()}</td>
                          <td>
                            <div className="order-customer">
                              <strong>{order.customerDetails?.name || 'Guest Customer'}</strong>
                              <span>{order.customerDetails?.phone || 'No phone'}</span>
                            </div>
                          </td>
                          <td><span className="pill pill-role">{isCustom ? 'Custom' : 'Fixed'}</span></td>
                          <td>
                            <select 
                              className={`pill-status-select ${statusClass}`}
                              value={order.status || 'pending'}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="in progress">In Progress</option>
                              <option value="ready">Ready</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>Rs. {Number(order.totalAmount || 0)}</td>
                          <td>
                            <div className="order-meta">
                              <select 
                                className="payment-status-select"
                                value={order.paymentStatus || 'pending'}
                                onChange={(e) => handleUpdatePaymentStatus(order._id, e.target.value)}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd',
                                  marginBottom: '4px',
                                  display: 'block'
                                }}
                              >
                                <option value="pending">pending payment</option>
                                <option value="completed">completed payment</option>
                              </select>
                              <span>{order.customerDetails?.address || 'Address pending'}</span>
                              {order.customerDetails?.upiId && (
                                <span style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>UPI: {order.customerDetails.upiId}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                          {ordersLoading ? 'Fetching orders...' : 'No orders found for this filter.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <div className="admin-header">
                <h1 className="editorial-title">Artsy Marketplace</h1>
                <div className="marketplace-subnav">
                  <button
                    className={`subnav-btn ${productSubTab === 'marketplace' ? 'active' : ''}`}
                    onClick={() => setProductSubTab('marketplace')}
                  >
                    Inventory
                  </button>
                  <button
                    className={`subnav-btn ${productSubTab === 'add' ? 'active' : ''}`}
                    onClick={() => setProductSubTab('add')}
                  >
                    {isEditing ? 'Edit Product' : 'Add Product'}
                  </button>
                </div>
              </div>

              {productSubTab === 'marketplace' ? (
                <div className="admin-inventory-full animate-fade-in">
                  {Object.keys(groupedProducts).length > 0 ? Object.keys(groupedProducts).map((category) => {
                    const categoryItems = groupedProducts[category];
                    return (
                      <div key={category} className="category-section">
                        <div className="category-section-header">
                          <h3 className="category-title">{category}</h3>
                          <span className="category-count">{categoryItems.length} products</span>
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
                              {categoryItems.map((product) => (
                                <tr key={product._id}>
                                  <td className="product-table-cell">
                                    <div className="item-preview">
                                      <img src={product.images?.[0]} alt={product.name} className="table-thumb" />
                                      <div className="table-info">
                                        <span className="p-name">{product.name}</span>
                                        <span className="p-id">{product._id.slice(-6).toUpperCase()}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td><span className="pill pill-role">{product.category}</span></td>
                                  <td>Rs. {Number(product.price || 0)}</td>
                                  <td>
                                    <div className="qty-control">
                                      <button
                                        className="qty-btn"
                                        onClick={() => handleUpdateStock(product._id, product.stock, -1)}
                                        disabled={product.stock === 0}
                                        title="Decrease stock"
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className={`pill stock-pill ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.stock > 0 ? `${product.stock} available` : 'Sold out'}
                                      </span>
                                      <button
                                        className="qty-btn"
                                        onClick={() => handleUpdateStock(product._id, product.stock, 1)}
                                        title="Increase stock"
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="controls-cell">
                                    <div className="control-actions">
                                      <button
                                        type="button"
                                        onClick={() => handleEditProduct(product)}
                                        className="control-btn edit-btn"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(product._id)}
                                        className="control-btn delete-btn"
                                      >
                                        Delete
                                      </button>
                                    </div>
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
                      {loading ? 'Loading products...' : 'The marketplace is currently empty.'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="admin-form-full animate-fade-in">
                  <div className="admin-form-container glass-card full-form">
                    <div className="form-header">
                      <h3>{isEditing ? 'Edit Product' : 'Create Product'}</h3>
                      <p>{isEditing ? `Update ${editingProduct?.name}.` : 'Describe the new product that should appear on the customer storefront.'}</p>
                    </div>

                    <form onSubmit={handleAddProduct} className="admin-form">
                      <div className="form-grid-three">
                        <div className="form-group">
                          <label className="metric-label">Product Name</label>
                          <input name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Velvet Sleepy Bunny" required className="admin-input" />
                        </div>

                        <div className="form-group">
                          <label className="metric-label">Price (Rs.)</label>
                          <input name="price" type="number" value={formData.price} onChange={handleFormChange} placeholder="0" className="admin-input" />
                        </div>

                        <div className="form-group">
                          <label className="metric-label">Product Type</label>
                          <select name="type" value={formData.type} onChange={handleFormChange} className="admin-input">
                            <option value="fixed">Fixed Price</option>
                            <option value="custom">Custom Quote</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className="metric-label">Category</label>
                            <button
                              type="button"
                              className="btn-link"
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => setIsAddingNewCategory((prev) => !prev)}
                            >
                              {isAddingNewCategory ? 'Back to list' : 'Add New'}
                            </button>
                          </div>

                          {isAddingNewCategory ? (
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="e.g. Wall Hangings"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              required
                            />
                          ) : (
                            <select name="category" value={formData.category} onChange={handleFormChange} className="admin-input" required>
                              <option value="Flowers">Flowers</option>
                              <option value="Soft Toys">Soft Toys</option>
                              <option value="Keychains">Keychains</option>
                              <option value="Combos">Combos</option>
                            </select>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="metric-label">Quantity in Stock</label>
                          <input name="stock" type="number" value={formData.stock} onChange={handleFormChange} min="0" className="admin-input" />
                        </div>

                        <div className="form-group">
                          <label className="metric-label">Production Info</label>
                          <input name="production" value={formData.production} onChange={handleFormChange} placeholder="Ships in 3-5 days" className="admin-input" />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 3' }}>
                          <label className="metric-label">Product Visual</label>
                          <div className="upload-preview-container">
                            {tempImageUrl || manualImageUrl ? (
                              <div className="upload-preview full-preview">
                                <img src={tempImageUrl || manualImageUrl} alt="Preview" />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                  <button type="button" className="btn-link" onClick={() => { setTempImageUrl(''); setManualImageUrl(''); }}>
                                    Replace Photo
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="upload-box full-box">
                                <input type="file" id="product-photo" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                <label htmlFor="product-photo" className="upload-label">
                                  {isUploading ? 'Uploading image...' : 'Choose from gallery or files'}
                                </label>
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#999' }}>
                            Or paste a public image link:
                            <input
                              value={manualImageUrl}
                              onChange={(e) => setManualImageUrl(e.target.value)}
                              placeholder="https://..."
                              className="admin-input-mini"
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 3' }}>
                          <label className="metric-label">Product Description</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            placeholder="The heart and soul of your product..."
                            required
                            className="admin-input"
                            style={{ height: '100px' }}
                          />
                        </div>
                      </div>

                      <div className="form-footer" style={{ gap: '2rem' }}>
                        {isEditing && (
                          <button type="button" className="btn btn-secondary" onClick={resetForm}>
                            Cancel Edit
                          </button>
                        )}
                        <button type="submit" disabled={isUploading} className="btn btn-primary auth-btn" style={{ padding: '1rem 3rem', opacity: isUploading ? 0.7 : 1 }}>
                          {isUploading ? 'Uploading...' : isEditing ? 'Save Product Changes' : 'Publish Product'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

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
                    {customers.length > 0 ? customers.map((customer) => (
                      <tr key={customer._id}>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td><span className="pill pill-role">{customer.role}</span></td>
                        <td><span className="pill pill-status active">Active</span></td>
                        <td><button className="btn-link" type="button" onClick={() => handleViewUserOrders(customer)}>View Orders</button></td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                          {loading ? 'Fetching customers...' : 'No customers registered yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-view animate-fade-in" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
              <div className="admin-header">
                <h1>Platform Settings</h1>
                <p>Configure your boutique&apos;s global parameters.</p>
              </div>

              <div className="admin-form-container glass-card" style={{ display: 'block' }}>
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

                  <div className="form-section">
                    <h4>Integrations Status</h4>
                    <div className="status-list">
                      <div className="status-item">
                        <span>Razorpay Payments</span>
                        <span className="pill pill-status active">UPI Ready</span>
                      </div>
                      <div className="status-item">
                        <span>Cloudinary Storage</span>
                        <span className="pill pill-status active">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Appearance</h4>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>Choose how the admin dashboard looks for you.</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        type="button" 
                        className={`pill ${theme === 'light' ? 'pill-role' : ''}`} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: theme === 'light' ? '#fbbf24' : 'transparent', color: theme === 'light' ? '#000' : '#666', border: '1px solid #ddd' }}
                        onClick={() => theme !== 'light' && toggleTheme()}
                      >
                        <Sun size={14} /> Light
                      </button>
                      <button 
                        type="button" 
                        className={`pill ${theme === 'dark' ? 'pill-role' : ''}`} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: theme === 'dark' ? '#fbbf24' : 'transparent', color: theme === 'dark' ? '#000' : '#666', border: '1px solid #ddd' }}
                        onClick={() => theme !== 'dark' && toggleTheme()}
                      >
                        <Moon size={14} /> Dark
                      </button>
                    </div>
                  </div>

                  <button type="button" className="auth-btn" style={{ marginTop: '2rem' }}>Save Configuration</button>
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
