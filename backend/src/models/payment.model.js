const mongoose = require('mongoose');

const PAYMENT_MODE_ENUM = ['cash', 'bank_transfer', 'cheque', 'upi', 'other'];
const PAYMENT_TYPE_ENUM = ['to_crusher', 'from_customer'];

const paymentSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  payment_number: {
    type: String,
    unique: true,
    required: true
  },
  
  payment_type: {
    type: String,
    enum: {
      values: PAYMENT_TYPE_ENUM,
      message: '{VALUE} is not a valid payment type'
    },
    required: [true, 'Payment type is required']
  },
  
  // For payments TO crusher
  crusher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crusher',
    required: function() {
      return this.payment_type === 'to_crusher';
    }
  },
  
  // For payments FROM customer  
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: function() {
      return this.payment_type === 'from_customer';
    }
  },
  
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  
  payment_date: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  
  payment_mode: {
    type: String,
    enum: {
      values: PAYMENT_MODE_ENUM,
      message: '{VALUE} is not a valid payment mode'
    },
    required: [true, 'Payment mode is required']
  },

  isActive: {
    type: Boolean,
    default: true // Changed from false to true
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Auto-generate payment number with monthly reset
paymentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Count ACTIVE payments for current month only
    const count = await mongoose.model('Payment').countDocuments({
      isActive: true,
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      }
    });
    
    this.payment_number = `PMT${yearMonth}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);