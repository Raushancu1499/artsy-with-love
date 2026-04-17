require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminEmail = 'admin@artsy.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists.');
    } else {
      const admin = new User({
        name: 'Artsy Admin',
        email: adminEmail,
        password: 'artsyadmin2026',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin account created successfully!');
      console.log('Email: admin@artsy.com');
      console.log('Password: artsyadmin2026');
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
