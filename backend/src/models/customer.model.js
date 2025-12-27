const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+91-?\d{10}$/, 'Phone must be in format +91-xxxxxxxxxx']
  },
    gst_number: {
    type: String,
    default: null,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  
  site_addresses: [{
    type: String,
    trim: true
  }],
    isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);