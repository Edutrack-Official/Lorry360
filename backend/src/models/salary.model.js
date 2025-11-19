const mongoose = require('mongoose');

const PAYMENT_MODE_ENUM = ['cash', 'bank_transfer', 'cheque', 'upi', 'other'];

const salarySchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver ID is required']
  },
  
  salary_number: {
    type: String,
    unique: true,
    required: true
  },
  
  // Advance tracking with balance
  advance_balance: {
    type: Number,
    default: 0
  },
  
  // Advance transactions (add/subtract)
  advance_transactions: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['given', 'deducted'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  
  // Bonus payments array
  bonus: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      trim: true
    }
  }],
  
  // Salary payments array
  amountpaid: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    payment_mode: {
      type: String,
      enum: {
        values: PAYMENT_MODE_ENUM,
        message: '{VALUE} is not a valid payment mode'
      },
      required: true
    },
    deducted_from_advance: {
      type: Boolean,
      default: false
    },
    advance_deduction_amount: {
      type: Number,
      default: 0,
      min: 0
    },
    cash_paid: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Auto-update advance balance when transactions are added
salarySchema.pre('save', function(next) {
  // Update advance balance from advance_transactions
  if (this.isModified('advance_transactions')) {
    this.advance_balance = this.advance_transactions.reduce((balance, transaction) => {
      if (transaction.type === 'given') {
        return balance + transaction.amount;
      } else if (transaction.type === 'deducted') {
        return balance - transaction.amount;
      }
      return balance;
    }, 0);
  }
  
  // Update cash_paid in amountpaid (auto-calculate)
  if (this.isModified('amountpaid')) {
    this.amountpaid.forEach(payment => {
      if (payment.deducted_from_advance) {
        payment.cash_paid = payment.amount - payment.advance_deduction_amount;
      } else {
        payment.cash_paid = payment.amount;
      }
    });
  }
  
  next();
});

// Auto-generate salary number with monthly reset
salarySchema.pre('save', async function(next) {
  if (this.isNew) {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const count = await mongoose.model('Salary').countDocuments({
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      }
    });
    
    this.salary_number = `SAL${yearMonth}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Compound index for driver salary records
salarySchema.index({ owner_id: 1, driver_id: 1 });

module.exports = mongoose.model('Salary', salarySchema);