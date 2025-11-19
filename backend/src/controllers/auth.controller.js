
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const {
  signAccessToken,
  signRefreshToken
} = require('../utils/jwt');

const loginUser = async ({ email, password }) => {
    
  const user = await User.findOne({ email });

  if (!user) throw new Error('Invalid email or password');

  if (!user.isActive) {
    throw new Error('User account is deactivated');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error('Invalid email or password');

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id, user.role);
  const frontend_version = process.env.FRONTEND_VERSION;

  // Prepare user response based on role
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  // Add owner-specific fields if role is owner
  if (user.role === 'owner') {
    userResponse.company_name = user.company_name;
    userResponse.address = user.address;
    userResponse.city = user.city;
    userResponse.state = user.state;
    userResponse.pincode = user.pincode;
    userResponse.plan_type = user.plan_type;
  }

  return {
    message: 'Login successful',
    accessToken,
    refreshToken,
    frontend_version,
    user: userResponse
  };
};

module.exports = { loginUser };