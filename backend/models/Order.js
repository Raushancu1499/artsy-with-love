const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    secondaryPhone: { type: String },
    address: { type: String, required: true },
    upiId: { type: String }
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      customizationDetails: { type: String }, // e.g., Name to engrave
      uploadedImage: { type: String } // For custom requests
    }
  ],
  totalAmount: { type: Number }, // Can be set later for custom orders
  status: { 
    type: String, 
    enum: ['pending', 'in progress', 'ready', 'shipped', 'delivered'], 
    default: 'pending' 
  },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentDetails: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    method: { type: String, default: 'upi' }
  },
  giftMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String },
    wrapRequested: { type: Boolean, default: false }
  },
  deliveryDateRequest: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
