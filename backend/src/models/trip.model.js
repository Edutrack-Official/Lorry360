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
    unique: true,
    required: true
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
  
  material_id: {
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
  
  no_of_unit: {
    type: Number,
    required: [true, 'Number of units is required'],
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
    required: [true, 'Customer is required']
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
  }
}, {
  timestamps: true
});

// Auto-generate trip number with monthly reset and calculate profit before saving
tripSchema.pre('save', async function(next) {
  if (this.isNew) {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Count trips for current month
    const count = await mongoose.model('Trip').countDocuments({
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      }
    });
    
    this.trip_number = `TR${yearMonth}${String(count + 1).padStart(4, '0')}`;
    
    // Auto-calculate profit
    if (this.customer_amount && this.crusher_amount) {
      this.profit = this.customer_amount - this.crusher_amount;
    }
  }
  next();
});

// Auto-calculate profit when amounts change
tripSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  if (update.customer_amount || update.crusher_amount) {
    const customer_amount = update.customer_amount || this.customer_amount;
    const crusher_amount = update.crusher_amount || this.crusher_amount;
    
    if (customer_amount && crusher_amount) {
      update.profit = customer_amount - crusher_amount;
    }
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);