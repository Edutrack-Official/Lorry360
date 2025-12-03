const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { sendOnboardingEmail, sendPasswordResetEmail } = require('../utils/emailClient');

const createUser = async (userData) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    company_name,
    address,
    city,
    state,
    pincode,
    plan_type
  } = userData;

  // Basic required fields validation
  if (!name || !email || !password || !role || !phone) {
    const err = new Error('Missing required fields: name, email, password, role, phone');
    err.status = 400;
    throw err;
  }

  // For owner role, validate business fields
  if (role === 'owner') {
    if (!company_name || !address || !city || !state || !pincode) {
      const err = new Error('For owner role, company_name, address, city, state, and pincode are required');
      err.status = 400;
      throw err;
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('User with this email already exists');
    err.status = 409;
    throw err;
  }

  // Create new user
  const newUser = new User({
    name,
    email,
    passwordHash,
    role,
    phone,
    ...(role === 'owner' && {
      company_name,
      address,
      city,
      state,
      pincode,
      plan_type: plan_type || 'trial'
    }),
    isActive: true
  });

  await newUser.save();

  // Send onboarding email
  setTimeout(() => {
    sendOnboardingEmail({ 
      toEmail: email, 
      name, 
      role, 
      password,
      ...(role === 'owner' && { company_name, plan_type: plan_type || 'trial' })
    }).catch(console.error);
  }, 0);

  return {
    message: 'User created successfully and onboarding email sent',
    userId: newUser._id
  };
};

const getAllUsers = async (filterParams = {}) => {
  const query = { 
    role: "owner"
  };
  
  

  const users = await User.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return {
    count: users.length,
    users
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-passwordHash');

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

const updateUser = async (id, updateData) => {
  // Handle password update
  if (updateData.password) {
    updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    delete updateData.password;
  }

  // Validate owner-specific fields if role is being updated to owner
  if (updateData.role === 'owner') {
    if (!updateData.company_name || !updateData.address || !updateData.city || 
        !updateData.state || !updateData.pincode) {
      const err = new Error('For owner role, company_name, address, city, state, and pincode are required');
      err.status = 400;
      throw err;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    id, 
    updateData, 
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!updatedUser) {
    const err = new Error('User not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedUser;
};

const forgotPassword = async (email, otp) => {
  if (!email) {
    const err = new Error('Email is required');
    err.status = 400;
    throw err;
  }

  if (!otp) {
    const err = new Error('OTP is required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email, isActive: true });

    if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  await sendPasswordResetEmail({ 
    toEmail: email, 
    name: user.name, 
    otp,
    ...(user.role === 'owner' && { company_name: user.company_name })
  });

  return genericResponse;
};

const resetPassword = async (email, password) => {
  if (!email || !password) {
    const err = new Error('Email and new password are required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email, isActive: true });

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  user.passwordHash = hashed;

  await user.save();

  return { message: 'Password reset successful' };
};

const deactivateUser = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).select('-passwordHash');

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return { message: 'User deactivated successfully', user };
};

const getAllOwners = async (filterParams = {}) => {
  const { isActive } = filterParams;
  const query = { role: 'owner' };
  
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const owners = await User.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return {
    count: owners.length,
    owners
  };
};
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  forgotPassword,
  resetPassword,
  deactivateUser
};