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

// const mongoose = require('mongoose');

// const reminderSchema = new mongoose.Schema({
//   owner_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },

//   note: {
//     type: String,
//     required: true,
//     trim: true
//   },

//   date: {
//     type: Date,
//     required: true
//   },

//   done: {
//     type: Boolean,
//     default: false
//   },

//   // ✅ WhatsApp Integration Fields
//   sendWhatsapp: {
//     type: Boolean,
//     default: true // user can turn off later (optional feature)
//   },

//   whatsappSent: {
//     type: Boolean,
//     default: false
//   },

//   whatsappSentAt: {
//     type: Date
//   }

// }, {
//   timestamps: true
// });

// // ✅ Indexes for faster queries
// reminderSchema.index({ owner_id: 1, date: 1 });
// reminderSchema.index({ owner_id: 1, done: 1 });
// reminderSchema.index({ date: 1, whatsappSent: 1 });

// module.exports = mongoose.model('Reminder', reminderSchema);
