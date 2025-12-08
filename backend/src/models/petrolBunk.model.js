const mongoose = require('mongoose');

const petrolBunkSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  bunk_name: {
    type: String,
    required: [true, 'Bunk name is required'],
    trim: true
  },
  
  address: {
    type: String,
    trim: true
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PetrolBunk', petrolBunkSchema);