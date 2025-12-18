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


const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true
  },
  endpoint: {
    type: String,
    required: true
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
