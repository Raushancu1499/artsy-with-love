import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import { ShoppingBag, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import './MyOrders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem('artsy_token');
        const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={20} />;
      case 'in progress': return <Package size={20} />;
      case 'ready': return <CheckCircle size={20} />;
      case 'shipped': return <Truck size={20} />;
      case 'delivered': return <CheckCircle size={20} style={{ color: 'var(--success)' }} />;
      case 'cancelled': return <XCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="orders-page-loading">
        <div className="loader animate-spin" />
        <p>Fetching your treasures...</p>
      </div>
    );
  }

  return (
    <div className="my-orders-page animate-fade-in">
      <div className="container">
        <div className="orders-header">
          <h1 className="editorial-title">My Orders</h1>
          <p>Track your handcrafted gifts and creations.</p>
        </div>

        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card premium-card">
                <div className="order-card-header">
                  <div className="order-id-group">
                    <span className="order-label">Order ID</span>
                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className={`order-status-pill ${order.status?.replace(' ', '-')}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status || 'Pending'}</span>
                  </div>
                </div>

                <div className="order-content">
                  <div className="order-items">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <img 
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/80'} 
                          alt={item.productId?.name} 
                          className="item-thumb"
                        />
                        <div className="item-info">
                          <strong>{item.productId?.name || 'Handcrafted Item'}</strong>
                          <span>Quantity: {item.quantity}</span>
                          {item.customizationDetails && (
                            <p className="custom-note">Note: {item.customizationDetails}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Total Amount</span>
                      <strong className="order-total">Rs. {order.totalAmount}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Payment Status</span>
                      <span className={`payment-badge ${order.paymentStatus}`}>{order.paymentStatus || 'pending'}</span>
                    </div>
                    <div className="summary-row">
                      <span>Placed On</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="order-timeline">
                  <div className={`timeline-step ${['pending', 'in progress', 'ready', 'shipped', 'delivered'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
                    <div className="step-marker" />
                    <span>Pending</span>
                  </div>
                  <div className={`timeline-step ${['in progress', 'ready', 'shipped', 'delivered'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
                    <div className="step-marker" />
                    <span>In Progress</span>
                  </div>
                  <div className={`timeline-step ${['ready', 'shipped', 'delivered'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
                    <div className="step-marker" />
                    <span>Ready</span>
                  </div>
                  <div className={`timeline-step ${['shipped', 'delivered'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
                    <div className="step-marker" />
                    <span>Shipped</span>
                  </div>
                  <div className={`timeline-step ${order.status === 'delivered' ? 'completed success' : ''}`}>
                    <div className="step-marker" />
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders glass-card">
            <ShoppingBag size={48} />
            <h2>No orders yet</h2>
            <p>Your shopping bag is waiting to be filled with love.</p>
            <a href="/products" className="btn btn-primary mt-4">Browse Shoppe</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
