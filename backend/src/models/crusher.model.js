const mongoose = require('mongoose');

const crusherSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  name: {
    type: String,
    required: [true, 'Crusher name is required'],
    trim: true
  },
  
  materials: [{
    material_name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true
    },
    price_per_unit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative']
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Crusher', crusherSchema);