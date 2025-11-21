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
    enum: ['cash', 'bank', 'upi'],
    default: 'cash'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);