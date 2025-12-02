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

// -----------------------------
// 🔥 PRE DELETE HOOK (Universal Reference Check)
// -----------------------------
lorrySchema.pre('findOneAndDelete', async function (next) {
  try {
    const lorryId = this.getQuery()._id;

    // Get all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();

    for (const col of collections) {
      const collection = mongoose.connection.db.collection(col.name);

      // Check if any document references this lorry using "lorry_id"
      const doc = await collection.findOne({ lorry_id: lorryId });
      if (doc) {
        return next(
          new Error(`Cannot delete lorry: Referenced in collection '${col.name}'`)
        );
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Lorry', lorrySchema);
