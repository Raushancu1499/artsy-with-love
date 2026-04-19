import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Loader, MessageCircle, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL, { DESTINATION_UPI_ID } from '../config/api';
import './Cart.css';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=';

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
  const [showQR, setShowQR] = useState(false);

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

  const submitManualOrder = async () => {
    if (!cartItems.length) return;
    if (!checkoutForm.fullName || !checkoutForm.email || !checkoutForm.primaryPhone || !checkoutForm.fullAddress) {
      setNotice({ type: 'error', text: 'Please fill in all required delivery details before submitting.' });
      return;
    }

    setIsProcessing(true);
    setNotice({ type: 'info', text: 'Submitting your manual order...' });

    try {
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
        paymentStatus: 'pending', // Pending verification for manual
        paymentDetails: {
          method: 'upi_manual',
        },
      };

      const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) throw new Error('Could not save order.');

      clearCart();
      setShowQR(false);
      setNotice({ type: 'success', text: 'Order submitted! We will verify your payment soon.' });
    } catch (error) {
      setNotice({ type: 'error', text: 'Failed to submit order.' });
    } finally {
      setIsProcessing(false);
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
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [{ method: 'upi' }]
              },
              others: {
                name: 'Cards / Netbanking',
                instruments: [{ method: 'card' }, { method: 'netbanking' }]
              }
            },
            sequence: ['block.upi', 'block.others'],
            preferences: { show_default_blocks: true }
          }
        },
        prefill: {
          name: checkoutForm.fullName,
          email: checkoutForm.email,
          contact: checkoutForm.primaryPhone,
          method: 'upi'
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
              <div className="cart-items-header">
                <span>Product</span>
                <span>Qty</span>
                <span>Price</span>
              </div>
              {cartItems.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="item-img">
                    <img src={item.image || item.images?.[0] || 'https://via.placeholder.com/300x300?text=Handmade+Gift'} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <div className="item-meta-top">
                      <span className="item-category-tag">{item.category || 'Handmade'}</span>
                    </div>
                    <h3>{item.name}</h3>
                    {item.giftMessage ? (
                      <p className="item-note">💌 {item.giftMessage}</p>
                    ) : null}
                    <div className="item-actions">
                      <div className="qty-controls">
                        <button type="button" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="remove-btn" onClick={() => removeFromCart(item._id)} title="Remove item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="item-price-col">
                    <span className="item-price">{CURRENCY}{(item.price * item.quantity).toLocaleString()}</span>
                    {item.quantity > 1 && <span className="item-unit-price">{CURRENCY}{item.price} each</span>}
                  </div>
                </div>
              ))}
              <div className="cart-continue">
                <Link to="/products" className="continue-shopping-link">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            <div className="cart-summary">
              <div className="summary-header">
                <h3>Order Summary</h3>
                <span className="summary-item-count">{cartItems.reduce((a,b)=>a+b.quantity,0)} item{cartItems.reduce((a,b)=>a+b.quantity,0)!==1?'s':''}</span>
              </div>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{CURRENCY}{subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>🚚 Shipping</span>
                  <span className="shipping-free">{CURRENCY}{shipping}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{CURRENCY}{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="checkout-card">
                <h4>📦 Delivery Details</h4>
                <div className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input id="fullName" type="text" value={checkoutForm.fullName} onChange={(e) => setField('fullName', e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" value={checkoutForm.email} onChange={(e) => setField('email', e.target.value)} placeholder="Where should we send the confirmation?" />
                  </div>
                  <div className="form-row-split">
                    <div className="form-group">
                      <label htmlFor="primaryPhone">Primary Phone</label>
                      <input id="primaryPhone" type="tel" value={checkoutForm.primaryPhone} onChange={(e) => setField('primaryPhone', e.target.value)} placeholder="Delivery number" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="secondaryPhone">Secondary Phone</label>
                      <input id="secondaryPhone" type="tel" value={checkoutForm.secondaryPhone} onChange={(e) => setField('secondaryPhone', e.target.value)} placeholder="Alternate number" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="fullAddress">Delivery Address</label>
                    <textarea id="fullAddress" rows="3" value={checkoutForm.fullAddress} onChange={(e) => setField('fullAddress', e.target.value)} placeholder="House number, street, area, city, state, pincode" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="upiId">UPI ID <span style={{fontWeight:400,color:'var(--text-light)',fontSize:'0.85rem'}}>(Optional)</span></label>
                    <input id="upiId" type="text" value={checkoutForm.upiId} onChange={(e) => setField('upiId', e.target.value)} placeholder="username@bankname" />
                  </div>
                </div>
              </div>

              {notice.text && (
                <div className={`cart-notice cart-notice-${notice.type || 'info'}`}>
                  {notice.text}
                </div>
              )}

              <div className="checkout-actions">
                <button type="button" className="btn btn-primary w-100 checkout-btn" onClick={handleCheckout} disabled={isProcessing}>
                  {isProcessing ? <Loader className="animate-spin" /> : <CreditCard size={18} />}
                  Pay via Razorpay
                </button>

                <div className="upi-direct-options">
                  <p className="selection-divider"><span>OR</span></p>
                  <a href={`upi://pay?pa=${DESTINATION_UPI_ID}&pn=Artsy%20With%20Love&am=${total}&cu=INR&tn=ArtsyOrder`} className="btn btn-outline w-100 upi-app-btn">
                    📱 Open UPI App (GPay / PhonePe)
                  </a>
                  <button type="button" className="btn btn-link w-100 mt-2 qr-toggle-btn" onClick={() => setShowQR(!showQR)}>
                    {showQR ? '▲ Hide QR Code' : '📷 Show Payment QR Code'}
                  </button>
                </div>

                {showQR && (
                  <div className="qr-container animate-fade-in">
                    <p className="qr-hint">Scan with GPay, PhonePe, or Paytm</p>
                    <img src={`${QR_API}${encodeURIComponent(`upi://pay?pa=${DESTINATION_UPI_ID}&pn=Artsy%20With%20Love&am=${total}&cu=INR&tn=ArtsyOrder`)}`} alt="Payment QR Code" className="qr-image" />
                    <p className="qr-total">Total: {CURRENCY}{total}</p>
                    <button type="button" className="btn btn-secondary w-100 mt-3" onClick={submitManualOrder} disabled={isProcessing}>
                      {isProcessing ? <Loader className="animate-spin" /> : '✅ I Have Paid — Submit Order'}
                    </button>
                  </div>
                )}

                <button type="button" className="btn btn-secondary w-100 whatsapp-checkout-btn" onClick={openWhatsAppOrder}>
                  <MessageCircle size={18} />
                  Order on WhatsApp
                </button>
              </div>

              <p className="secure-checkout-msg">🔒 Payments processed securely via Razorpay</p>
            </div>
          </div>
        ) : (
          <div className="empty-cart">
            <div className="empty-cart-inner">
              <ShoppingBag size={64} className="empty-cart-icon" />
              <h2>Your cart is empty</h2>
              <p>Discover our handmade crochet collection and find something beautiful.</p>
              <Link to="/products" className="btn btn-primary mt-4">Browse the Collection →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
