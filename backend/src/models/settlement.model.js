const mongoose = require('mongoose');

const SETTLEMENT_STATUS_ENUM = ['pending', 'partially_paid', 'completed', 'cancelled'];
const PAYMENT_MODE_ENUM = ['cash', 'bank_transfer', 'upi', 'cheque', 'online'];
const SETTLEMENT_TYPE_ENUM = ['payable', 'receivable', 'net_settlement'];
const TRIP_DIRECTION_ENUM = ['a_to_b', 'b_to_a'];
const PAYMENT_STATUS_ENUM = ['pending', 'approved', 'rejected', 'cancelled'];

const settlementSchema = new mongoose.Schema({
  // Primary owners involved
  owner_A_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  owner_B_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Net settlement details
  settlement_type: {
    type: String,
    enum: SETTLEMENT_TYPE_ENUM,
    required: true
  },
  
  // Amount that owner_A needs to pay to owner_B (positive = A pays B, negative = B pays A)
  net_amount: {
    type: Number,
    required: true
  },
  
  // Breakdown of amounts
  amount_breakdown: {
    a_to_b_trips_amount: { type: Number, default: 0 }, // A using B's lorry
    b_to_a_trips_amount: { type: Number, default: 0 }, // B using A's lorry
    net_payable_by: {
      type: String,
      enum: ['owner_A', 'owner_B', 'none'],
      required: true
    }
  },
  
  // Detailed trip breakdown
  trip_breakdown: [{
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    direction: {
      type: String,
      enum: TRIP_DIRECTION_ENUM,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    trip_number: {
      type: String,
      required: true
    },
    trip_date: {
      type: Date,
      required: true
    },
    material_name: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    settlement_amount: {
      type: Number,
      required: true
    }
  }],
  
  // Current settlement status
  paid_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  due_amount: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: SETTLEMENT_STATUS_ENUM,
    default: 'pending'
  },
  
  // Period for settlement
  from_date: {
    type: Date,
    required: true
  },
  
  to_date: {
    type: Date,
    required: true
  },
  
  // All trips included in this net settlement (for quick reference)
  trip_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  }],
  
  // Payment history with approval workflow
  payments: [{
    paid_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    paid_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    payment_date: {
      type: Date,
      default: Date.now
    },
    payment_mode: {
      type: String,
      enum: PAYMENT_MODE_ENUM,
      required: true
    },
    reference_number: {
      type: String,
      trim: true
    },
    proof_document: {
      type: String, // URL to payment proof image/document
      trim: true
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS_ENUM,
      default: 'pending'
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approved_at: {
      type: Date
    },
    rejection_reason: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Virtual for approved payments amount
settlementSchema.virtual('approved_payments_amount').get(function() {
  return this.payments
    .filter(payment => payment.status === 'approved')
    .reduce((sum, payment) => sum + payment.amount, 0);
});

// Virtual for pending payments amount
settlementSchema.virtual('pending_payments_amount').get(function() {
  return this.payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
});

// Update due amount when payments are modified
settlementSchema.pre('save', function(next) {
  this.due_amount = this.net_amount - this.approved_payments_amount;
  
  // Update settlement status based on approved payments
  if (this.due_amount <= 0) {
    this.status = 'completed';
  } else if (this.approved_payments_amount > 0) {
    this.status = 'partially_paid';
  } else {
    this.status = 'pending';
  }
  
  next();
});
module.exports = mongoose.model('Settlement', settlementSchema);