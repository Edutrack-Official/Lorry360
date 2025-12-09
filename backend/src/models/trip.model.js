const mongoose = require('mongoose');

const TRIP_STATUS_ENUM = ['scheduled', 'dispatched', 'loaded', 'in_transit', 'delivered', 'completed', 'cancelled'];

const tripSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  trip_number: {
    type: String,
    required: true
  },
  
  dc_number: {
    type: String,
    trim: true
  },
  
  // Vehicle and Driver
  lorry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lorry',
    required: [true, 'Lorry is required']
  },
  
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required']
  },
  
  // Source
  crusher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crusher',
    required: [true, 'Crusher is required']
  },
  
  material_name: {
    type: String,
    required: [true, 'Material ID is required'],
    trim: true
  },
  
  // Pricing and Units
  rate_per_unit: {
    type: Number,
    required: [true, 'Rate per unit is required'],
    min: 0
  },
  
  no_of_unit_crusher: {
    type: Number,
    required: [true, 'Number of units at crusher is required'],
    min: 0
  },
  
  no_of_unit_customer: {
    type: Number,
    required: [true, 'Number of units at customer is required'],
    min: 0
  },
  
  crusher_amount: {
    type: Number, // Amount paid to crusher
    required: [true, 'Crusher amount is required'],
    min: 0
  },
  
  // Destination
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  collab_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  
  customer_amount: {
    type: Number, // Amount received from customer
    required: [true, 'Customer amount is required'],
    min: 0
  },
  
  // Profit (auto-calculated)
  profit: {
    type: Number, // customer_amount - crusher_amount
    min: 0
  },
  
  // Trip Details
  trip_date: {
    type: Date,
    required: [true, 'Trip date is required'],
    default: Date.now
  },
  
  status: {
    type: String,
    enum: {
      values: TRIP_STATUS_ENUM,
      message: '{VALUE} is not a valid status'
    },
    default: 'scheduled'
  },
  
  // Timestamps for tracking
  dispatched_at: {
    type: Date,
    default: null
  },
  
  loaded_at: {
    type: Date,
    default: null
  },
  
  delivered_at: {
    type: Date,
    default: null
  },
  
  completed_at: {
    type: Date,
    default: null
  },
  
  // Additional Info
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Trip', tripSchema);