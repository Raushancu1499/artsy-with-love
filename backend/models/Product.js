const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  type: { type: String, enum: ['fixed', 'custom'], required: true },
  price: { type: Number }, // Only for fixed
  category: { type: String, required: true },
  occasions: [{ type: String }],
  labels: [{ type: String }], // Best Seller, New
  productionTimeline: { type: String, default: 'Made to order - ships in 3-5 days' },
  stock: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
