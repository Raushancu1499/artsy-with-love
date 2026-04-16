import { useState } from 'react';
import API_BASE_URL from '../config/api';
import './Admin.css';
import { LayoutDashboard, ShoppingBag, Palette, Users, Settings } from 'lucide-react';

function Admin() {
  const [activeTab, setActiveTab] = useState('products');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newProduct = {
      name: form.name.value,
      description: form.description.value,
      price: Number(form.price.value),
      type: form.type.value,
      category: form.category.value,
      images: [form.image.value || 'https://via.placeholder.com/600x600?text=New+Product']
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if(res.ok) alert("Product added dynamically to MongoDB!");
      form.reset();
    } catch(err) {
      alert("Failed to add product! Make sure the backend server is running.");
    }
  };

  return (
    <div className="admin-page">
      <div className="container admin-container">
        <aside className="admin-sidebar">
          <h2>Admin Panel</h2>
          <ul className="admin-nav">
            <li><button className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={18} /> Dashboard</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><ShoppingBag size={18} /> Orders</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}><Palette size={18} /> Products</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><Users size={18} /> Customers</button></li>
            <li><button className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Settings</button></li>
          </ul>
        </aside>

        <main className="admin-content">
          {activeTab === 'orders' && (
            <div>
              <div className="admin-header">
                <h1>Manage Orders</h1>
                <div className="admin-actions">
                  <select className="admin-select">
                    <option>All Statuses</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#ORD-1001</td>
                      <td>Jane Doe</td>
                      <td><span className="badge badge-bestseller">Fixed</span></td>
                      <td>Oct 20, 2026</td>
                      <td><span className="status-badge status-pending">Pending</span></td>
                      <td>₹999</td>
                      <td><button className="btn-link">View</button></td>
                    </tr>
                    <tr>
                      <td>#ORD-1002</td>
                      <td>Sam Smith</td>
                      <td><span className="badge badge-new">Custom</span></td>
                      <td>Oct 21, 2026</td>
                      <td><span className="status-badge status-progress">In Progress</span></td>
                      <td>--</td>
                      <td><button className="btn-link">Quote Price</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'products' && (
            <div>
              <div className="admin-header">
                <h1>Manage Products</h1>
              </div>
              <div className="admin-form-container">
                <h3>Add New Product</h3>
                <form onSubmit={handleAddProduct} className="admin-form" style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginTop: '1rem'}}>
                  <input name="name" placeholder="Product Name" required className="admin-input" />
                  <textarea name="description" placeholder="Description" required className="admin-input"></textarea>
                  <input name="price" type="number" placeholder="Price (₹)" className="admin-input" />
                  <select name="type" className="admin-input">
                    <option value="fixed">Fixed Pricing</option>
                    <option value="custom">Custom Pricing</option>
                  </select>
                  <select name="category" className="admin-input">
                    <option value="Flowers">Flowers</option>
                    <option value="Soft Toys">Soft Toys</option>
                    <option value="Keychains">Keychains</option>
                    <option value="Combos">Gift Combos</option>
                  </select>
                  <input name="image" placeholder="Image URL (Optional fallback)" className="admin-input" />
                  <button type="submit" className="btn btn-primary" style={{width: 'fit-content'}}>Save Product</button>
                </form>
              </div>
            </div>
          )}

          {(activeTab !== 'orders' && activeTab !== 'products') && (
            <div>
              <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              <p>Module coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;
