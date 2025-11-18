
const mongoose = require('mongoose');

const ROLE_ENUM = ['admin', 'owner'];
const PLAN_ENUM = ['trial', 'basic', 'professional', 'enterprise'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Email format is invalid']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+91-?\d{10}$/, 'Phone must be in format +91-xxxxxxxxxx']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    enum: {
      values: ROLE_ENUM,
      message: '{VALUE} is not a valid role'
    },
    required: [true, 'Role is required']
  },
  
  // Fields for lorry owners only (optional for admin)
  company_name: {
    type: String,
    required: function() {
      return this.role === 'owner';
    },
    trim: true
  },
  address: {
    type: String,
    required: function() {
      return this.role === 'owner';
    },
    trim: true
  },
  city: {
    type: String,
    required: function() {
      return this.role === 'owner';
    },
    trim: true
  },
  state: {
    type: String,
    required: function() {
      return this.role === 'owner';
    },
    trim: true
  },
  pincode: {
    type: String,
    required: function() {
      return this.role === 'owner';
    },
    match: [/^\d{6}$/, 'Pincode must be 6 digits']
  },
  plan_type: {
    type: String,
    enum: {
      values: PLAN_ENUM,
      message: '{VALUE} is not a valid plan'
    },
    required: function() {
      return this.role === 'owner';
    },
    default: 'trial'
  },

  // Common field
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);