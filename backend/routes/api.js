const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Razorpay = require('razorpay');
const crypto = require('crypto');
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// --- Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_api_secret'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'artsy_with_love_custom',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage: storage });

// --- Razorpay Config ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret'
});

// --- Auth API ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// --- Products API ---
// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get unique categories and their representative images
router.get('/categories', async (req, res) => {
  try {
    const categoriesRoot = await Product.aggregate([
      { $group: { _id: "$category", image: { $first: { $arrayElemAt: ["$images", 0] } } } }
    ]);
    res.json(categoriesRoot.map(c => ({ name: c._id, image: c.image })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create product (Admin Only)
router.post('/products', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' });
  }
});

// --- Orders API ---
// Get all orders (Admin Only)
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId items.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create order / custom request
router.post('/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

// --- Integrations API ---
const User = require('../models/User');

// Admin Stats
router.get('/admin/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();
    
    // Mocking revenue for demo purposes based on orders
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    res.json({
      products: productCount,
      orders: orderCount,
      users: userCount,
      revenue: totalRevenue
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get all customers (Admin Only)
router.get('/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Upload Image (Cloudinary)
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    // Return the secure URL from Cloudinary
    res.json({ imageUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Create Razorpay Order
router.post('/payments/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;
    
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency,
      receipt
    };

    if (process.env.RAZORPAY_KEY_ID === 'mock_key_id') {
      // Mock flow if API keys are not provided
      return res.json({ id: 'mock_order_id', amount: options.amount, currency: options.currency });
    }

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).json({ error: 'Failed to create payment order', details: err.message });
  }
});

// Verify Razorpay Payment Details
router.post('/payments/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (process.env.RAZORPAY_KEY_SECRET === 'mock_key_secret') {
    return res.json({ status: 'success', message: 'Payment verified (mocked)' });
  }

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ status: 'success', message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ status: 'failure', message: 'Invalid payment signature' });
  }
});

module.exports = router;
