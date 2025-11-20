const mongoose = require('mongoose');

const SALARY_TYPE_ENUM = ['fixed', 'per_trip'];
const DRIVER_STATUS_ENUM = ['active', 'inactive'];

const driverSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+91-?\d{10}$/, 'Phone must be in format +91-xxxxxxxxxx']
  },
  
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },  
  salary_per_duty: {
    type: Number,
    min: 0
  },
   salary_per_trip: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: {
      values: DRIVER_STATUS_ENUM,
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);