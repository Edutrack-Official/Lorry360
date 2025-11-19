const mongoose = require('mongoose');

const ATTENDANCE_STATUS_ENUM = ['fullduty', 'halfduty', 'absent'];

const attendanceSchema = new mongoose.Schema({
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

  lorry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lorry',
    required: [true, 'Lorry ID is required']
  },
  
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  
  status: {
    type: String,
    enum: {
      values: ATTENDANCE_STATUS_ENUM,
      message: '{VALUE} is not a valid attendance status'
    },
    required: [true, 'Attendance status is required'],
    default: 'fullduty'
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per driver per day
attendanceSchema.index({ driver_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);