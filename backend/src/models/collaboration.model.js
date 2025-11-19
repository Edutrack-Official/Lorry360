const mongoose = require('mongoose');

const COLLAB_STATUS_ENUM = ['pending', 'active', 'rejected'];

const collaborationSchema = new mongoose.Schema({
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
  
  status: {
    type: String,
    enum: COLLAB_STATUS_ENUM,
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Collaboration', collaborationSchema);