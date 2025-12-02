const mongoose = require('mongoose');

const LORRY_STATUS_ENUM = ['active', 'maintenance', 'inactive'];

const lorrySchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  registration_number: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  
  nick_name: {
    type: String,
    trim: true
  },
  
  status: {
    type: String,
    enum: {
      values: LORRY_STATUS_ENUM,
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lorry', lorrySchema);