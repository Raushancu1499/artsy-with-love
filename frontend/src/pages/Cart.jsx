import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Loader, MessageCircle, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import './Cart.css';

const CURRENCY = '\u20B9';
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210').replace(/\D/g, '');

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
    fullAddress: '',
    upiId: '',
  });

  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!user) return;

    setCheckoutForm(prev => ({
      ...prev,
      fullName: prev.fullName || user.name || '',
      email: prev.email || user.email || '',
    }));
  }, [user]);

  const setField = (name, value) => {
    setCheckoutForm(prev => ({ ...prev, [name]: value }));
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      'Hi Artsy With Love, I would like to order the following items:',
      ...cartItems.map((item) => `- ${item.name} x ${item.quantity}`),
      `Subtotal: ${CURRENCY}${subtotal}`,
      `Shipping: ${CURRENCY}${shipping}`,
      `Total: ${CURRENCY}${total}`,
      '',
      `Name: ${checkoutForm.fullName || user?.name || ''}`,
      `Email: ${checkoutForm.email || user?.email || ''}`,
      `Primary phone: ${checkoutForm.primaryPhone}`,
      `Secondary phone: ${checkoutForm.secondaryPhone}`,
      `Address: ${checkoutForm.fullAddress}`,
      `UPI ID: ${checkoutForm.upiId || 'Not provided'}`,
      '',
      'Please confirm the next steps for delivery and UPI payment.',
    ];

    return lines.join('\n');
  };

  const openWhatsAppOrder = () => {
    if (!cartItems.length) {
      setNotice({ type: 'error', text: 'Add a product to your cart before sending a WhatsApp order.' });
      return;
    }

    if (!WHATSAPP_NUMBER) {
      setNotice({ type: 'error', text: 'WhatsApp number is not configured yet.' });
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const submitPaidOrder = async (paymentData) => {
    const orderPayload = {
      customerDetails: {
        name: checkoutForm.fullName,
        email: checkoutForm.email,
        phone: checkoutForm.primaryPhone,
        secondaryPhone: checkoutForm.secondaryPhone,
        address: checkoutForm.fullAddress,
        upiId: checkoutForm.upiId,
      },
      items: cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        customizationDetails: item.giftMessage || '',
      })),
      userId: user?.id,
      totalAmount: total,
      status: 'pending',
      paymentStatus: 'completed',
      paymentDetails: {
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
        method: 'upi',
      },
    };

    const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      const errorData = await orderRes.json().catch(() => ({}));
      throw new Error(errorData.error || 'Order could not be saved after payment.');
    }
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      setNotice({ type: 'error', text: 'Your cart is empty.' });
      return;
    }

    if (!checkoutForm.fullName || !checkoutForm.email || !checkoutForm.primaryPhone || !checkoutForm.secondaryPhone || !checkoutForm.fullAddress) {
      setNotice({ type: 'error', text: 'Please fill in your full name, email, both phone numbers, and delivery address.' });
      return;
    }

    if (typeof window === 'undefined' || !window.Razorpay) {
      setNotice({ type: 'error', text: 'Payment checkout is not available right now.' });
      return;
    }

    setIsProcessing(true);
    setNotice({ type: 'info', text: 'Preparing your UPI checkout...' });

    try {
      const orderRes = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `artsy-${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Unable to create payment order.');
      }

      const configRes = await fetch(`${API_BASE_URL}/api/payments/config`);
      const configData = await configRes.json();
      const keyId = configData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '';

      if (!keyId) {
        throw new Error('Razorpay public key is not configured.');
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Artsy With Love',
        description: 'Handmade crochet gift order',
        order_id: orderData.id,
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
        },
        prefill: {
          name: checkoutForm.fullName,
          email: checkoutForm.email,
          contact: checkoutForm.primaryPhone,
        },
        notes: {
          address: checkoutForm.fullAddress,
          secondary_phone: checkoutForm.secondaryPhone,
          items: cartItems.map((item) => `${item.name} x ${item.quantity}`).join(', '),
        },
        theme: {
          color: '#b5838d',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setNotice({ type: 'info', text: 'Payment window closed before completion.' });
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }

            await submitPaidOrder(response);
            clearCart();
            setNotice({ type: 'success', text: 'Payment successful. Your order has been placed.' });
          } catch (error) {
            setNotice({ type: 'error', text: error.message || 'Payment completed but order could not be saved.' });
          } finally {
            setIsProcessing(false);
          }
        },
      });

      razorpay.on('payment.failed', (response) => {
        setNotice({
          type: 'error',
          text: response.error?.description || 'Payment failed. Please try again.',
        });
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Checkout failed.' });
      setIsProcessing(false);
    }
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
                    <img src={item.image || item.images?.[0] || 'https://via.placeholder.com/300x300?text=Handmade+Gift'} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">{CURRENCY}{item.price}</p>
                    {item.giftMessage ? (
                      <p className="item-note">Gift note: {item.giftMessage}</p>
                    ) : null}
                    <div className="item-actions">
                      <div className="qty-controls">
                        <button type="button" onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="remove-btn" onClick={() => removeFromCart(item._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{CURRENCY}{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{CURRENCY}{shipping}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{CURRENCY}{total}</span>
              </div>

              <div className="checkout-card">
                <h4>Delivery Details</h4>
                <div className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      value={checkoutForm.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={checkoutForm.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="primaryPhone">Primary Phone Number</label>
                    <input
                      id="primaryPhone"
                      type="tel"
                      value={checkoutForm.primaryPhone}
                      onChange={(e) => setField('primaryPhone', e.target.value)}
                      placeholder="Delivery contact number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="secondaryPhone">Secondary Phone Number</label>
                    <input
                      id="secondaryPhone"
                      type="tel"
                      value={checkoutForm.secondaryPhone}
                      onChange={(e) => setField('secondaryPhone', e.target.value)}
                      placeholder="Alternate contact number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fullAddress">Full Delivery Address</label>
                    <textarea
                      id="fullAddress"
                      rows="4"
                      value={checkoutForm.fullAddress}
                      onChange={(e) => setField('fullAddress', e.target.value)}
                      placeholder="House number, street, area, city, state, pincode"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="upiId">UPI ID (Optional)</label>
                    <input
                      id="upiId"
                      type="text"
                      value={checkoutForm.upiId}
                      onChange={(e) => setField('upiId', e.target.value)}
                      placeholder="e.g. username@bankname"
                    />
                  </div>
                </div>
              </div>

              {notice.text && (
                <div className={`cart-notice cart-notice-${notice.type || 'info'}`}>
                  {notice.text}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary w-100 checkout-btn"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader className="animate-spin" /> : <CreditCard size={18} />}
                Pay with UPI
              </button>

              <button
                type="button"
                className="btn btn-secondary w-100 whatsapp-checkout-btn"
                onClick={openWhatsAppOrder}
              >
                <MessageCircle size={18} />
                Order on WhatsApp
              </button>

              <p className="secure-checkout-msg">UPI checkout is handled securely through Razorpay.</p>
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
