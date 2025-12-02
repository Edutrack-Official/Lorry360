const mongoose = require('mongoose');

const ATTENDANCE_STATUS_ENUM = ['fullduty', 'halfduty','doubleduty', 'absent', 'tripduty', 'custom'];

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
     required: function() {
      return this.status !== 'absent';
    }
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
  },
   salary_amount: {
    type: Number,
    min: 0,
    default: 0
  },
   no_of_trips: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per driver per day
attendanceSchema.index({ driver_id: 1, date: 1 }, { unique: true });


// Validation middleware
attendanceSchema.pre('save', function(next) {
  // If status is 'absent', set lorry_id to null
  if (this.status === 'absent') {
    this.lorry_id = null;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);