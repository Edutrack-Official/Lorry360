const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { sendOnboardingEmail, sendPasswordResetEmail } = require('../utils/emailClient');
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Blob Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const LOGO_CONTAINER_NAME = process.env.LOGO_CONTAINER_NAME;

// Upload logo to Azure Blob Storage
const uploadLogoToBlob = async (file) => {
  if (!file || !file.buffer) return null;
  
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(LOGO_CONTAINER_NAME);
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists({ access: 'blob' });
    
    // Generate unique blob name
    const fileExtension = file.originalname ? file.originalname.split('.').pop() : 
                         (file.mimetype ? file.mimetype.split('/')[1] : 'jpg');
    const blobName = `logo-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload the file
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype || 'image/jpeg' }
    });
    
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading logo to blob:', error);
    throw new Error('Failed to upload logo');
  }
};

// Delete logo from Azure Blob Storage
const deleteLogoFromBlob = async (logoUrl) => {
  if (!logoUrl) return;
  
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(LOGO_CONTAINER_NAME);
    
    const urlObj = new URL(logoUrl);
    const pathname = urlObj.pathname;
    const pathParts = pathname.split('/').filter(part => part);
    const blobName = pathParts.length > 1 ? pathParts.slice(1).join('/') : pathParts[0];
    
    if (!blobName) {
      console.error("Could not extract blob name from URL:", logoUrl);
      return;
    }
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    
    console.log(`Successfully deleted logo blob: ${blobName}`);
  } catch (err) {
    console.error(`Error deleting logo blob from URL ${logoUrl}:`, err.message);
  }
};

// Extract logo URL from user data for deletion
const extractLogoUrlFromUser = (userData) => {
  // If logo is being updated, check if old logo needs deletion
  if (userData.logo && typeof userData.logo === 'string') {
    return userData.logo;
  }
  return null;
};

const createUser = async (userData, logoFile = null) => {
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

  // Upload logo if provided
  let logoUrl = null;
  if (logoFile) {
    // Validate file type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimeTypes.includes(logoFile.mimetype)) {
      const err = new Error('Invalid logo file type. Supported types: JPEG, PNG, GIF, WebP');
      err.status = 400;
      throw err;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (logoFile.size > maxSize) {
      const err = new Error('Logo file size exceeds 5MB limit');
      err.status = 400;
      throw err;
    }
    
    logoUrl = await uploadLogoToBlob(logoFile);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Clean up uploaded logo if user creation fails
    if (logoUrl) {
      await deleteLogoFromBlob(logoUrl).catch(console.error);
    }
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
    logo: logoUrl,
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
    userId: newUser._id,
    hasLogo: !!logoUrl
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

const updateUser = async (id, updateData, logoFile = null) => {
  // Find existing user
  const existingUser = await User.findById(id);
  if (!existingUser) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Handle logo update
  let logoUrl = existingUser.logo;
  if (logoFile) {
    // Validate file type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimeTypes.includes(logoFile.mimetype)) {
      const err = new Error('Invalid logo file type. Supported types: JPEG, PNG, GIF, WebP');
      err.status = 400;
      throw err;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (logoFile.size > maxSize) {
      const err = new Error('Logo file size exceeds 5MB limit');
      err.status = 400;
      throw err;
    }
    
    // Delete old logo if exists
    if (logoUrl) {
      await deleteLogoFromBlob(logoUrl).catch(console.error);
    }
    
    // Upload new logo
    logoUrl = await uploadLogoToBlob(logoFile);
    updateData.logo = logoUrl;
  } else if (updateData.logo === null || updateData.logo === '') {
    // If logo is being removed
    if (logoUrl) {
      await deleteLogoFromBlob(logoUrl).catch(console.error);
    }
    updateData.logo = null;
  }

  // Handle password update
  if (updateData.password) {
    updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    delete updateData.password;
  }

  // Validate owner-specific fields if role is being updated to owner
  if (updateData.role === 'owner' || (existingUser.role === 'owner' && !updateData.role)) {
    const ownerData = updateData.role === 'owner' ? updateData : existingUser;
    if (!ownerData.company_name || !ownerData.address || !ownerData.city || 
        !ownerData.state || !ownerData.pincode) {
      // Clean up uploaded logo if validation fails
      if (logoFile && logoUrl) {
        await deleteLogoFromBlob(logoUrl).catch(console.error);
      }
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
    // Clean up uploaded logo if update fails
    if (logoFile && logoUrl) {
      await deleteLogoFromBlob(logoUrl).catch(console.error);
    }
    const err = new Error('User not found or update failed');
    err.status = 404;
    throw err;
  }
  
  return {
    ...updatedUser.toObject(),
    hasLogo: !!updatedUser.logo
  };
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

  return { message: 'OTP sent successful' };
}

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

const deleteUserLogo = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Delete logo from blob storage if exists
  if (user.logo) {
    await deleteLogoFromBlob(user.logo);
  }

  // Update user to remove logo
  user.logo = null;
  await user.save();

  return { 
    message: 'Logo deleted successfully',
    user: {
      ...user.toObject(),
      hasLogo: false
    }
  };
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  forgotPassword,
  resetPassword,
  deactivateUser,
  getAllOwners,
  deleteUserLogo,
  uploadLogoToBlob,
  deleteLogoFromBlob
};