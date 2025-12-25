const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  lorry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lorry',
    required: true
  },
  
  bunk_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PetrolBunk',
    default: null
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  category: {
    type: String,
    required: true,
    enum: ['fuel', 'maintenance', 'repair', 'toll', 'fine', 'other']
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  description: {
    type: String
  },
  
  payment_mode: {
    type: String,
    required: true,
    enum: ['cash', 'bank', 'upi','credit'],
    default: 'cash'
  },
   proof: {
    type: String,
    default: null,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
expenseSchema.index({ owner_id: 1, lorry_id: 1, date: -1 });
expenseSchema.index({ bunk_id: 1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);