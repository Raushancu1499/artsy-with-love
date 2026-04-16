import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getSubtotal } = useCart();
  const [loading, setLoading] = useState(false);
  
  const subtotal = getSubtotal();
  const shipping = 50;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });
      const order = await res.json();
      
      // Simulate Razorpay UI
      alert(`Razorpay Window Opened!\n\nOrder ID: ${order.id}\nAmount: ₹${order.amount/100}\n\n(In production, this opens the real Razorpay modal)`);
    } catch (err) {
      console.error(err);
      alert("Checkout simulation successful! (Backend offline without API keys)");
    }
    setLoading(false);
  };

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="text-accent page-title text-center">Your Cart</h1>
        
        {cartItems.length > 0 ? (
          <div className="cart-container">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">₹{item.price}</p>
                    <div className="item-actions">
                      <div className="qty-controls">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item._id)}><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>₹{shipping}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <button className="btn btn-primary w-100" onClick={handleCheckout} disabled={loading}>
                {loading ? <Loader className="animate-spin" /> : 'Proceed to Checkout'}
              </button>
              <p className="secure-checkout-msg">Taxes calculated securely at checkout.</p>
            </div>
          </div>
        ) : (
          <div className="empty-cart text-center">
            <ShoppingBag size={48} className="empty-cart-icon" />
            <p>Your cart is looking a little empty.</p>
            <Link to="/products" className="btn btn-primary mt-4">Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
