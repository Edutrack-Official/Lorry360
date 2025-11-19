const mongoose = require('mongoose');

const TRANSACTION_STATUS_ENUM = ['pending', 'approved', 'paid'];

const collabTransactionSchema = new mongoose.Schema({
  collaboration_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collaboration',
    required: true
  },
  
  from_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  to_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
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
  
  // "need_payment" = from_owner needs to pay to_owner
  // "give_payment" = from_owner will receive payment from to_owner  
  type: {
    type: String,
    enum: ['need_payment', 'give_payment'],
    required: true
  },
  
  note: {
    type: String,
    trim: true
  },
  
  status: {
    type: String,
    enum: TRANSACTION_STATUS_ENUM,
    default: 'pending'
  },
  
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CollabTransaction', collabTransactionSchema);