const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  note: {
    type: String,
    required: true,
    trim: true
  },
  
  date: {
    type: Date,
    required: true
  },
  
  done: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Simple index for fetching by owner and date
reminderSchema.index({ owner_id: 1, date: 1 });
reminderSchema.index({ owner_id: 1, done: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);