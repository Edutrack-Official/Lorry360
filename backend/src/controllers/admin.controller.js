const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const initializeAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lorrymanagement.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = new User({
        name: 'System Administrator',
        email: adminEmail,
        phone: '+91-9876543210',
        passwordHash: passwordHash,
        role: 'admin',
        isActive: true
      });
      
      await adminUser.save();
      
      return {
        success: true,
        message: 'Admin user created successfully',
        data: {
          email: adminEmail,
          password: adminPassword,
          note: 'Please change the password after first login'
        }
      };
    } else {
      return {
        success: true,
        message: 'Admin user already exists',
        data: {
          email: existingAdmin.email,
          exists: true
        }
      };
    }
  } catch (error) {
    console.error('Error initializing admin user:', error.message);
    throw new Error(`Failed to initialize admin: ${error.message}`);
  }
};

module.exports = {
  initializeAdmin
};