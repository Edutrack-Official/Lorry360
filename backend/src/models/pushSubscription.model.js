// const mongoose = require("mongoose");

// const pushSubscriptionSchema = new mongoose.Schema({
//   owner_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   subscription: {
//     type: Object,
//     required: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);

// models/pushSubscription.model.js

const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,     // 🔥 REAL UNIQUE ID
    index: true
  },

  device_id: {
    type: String,
    required: true,
    index: true       
  },

  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true
  },

  subscription: {
    type: Object,
    required: true
  },

  is_active: {
    type: Boolean,
    default: true
  },

  last_seen_at: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
