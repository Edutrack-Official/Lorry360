// const PushSubscription = require("../models/pushSubscription.model");

// const saveSubscription = async (owner_id, subscription) => {
//   if (!subscription) {
//     const err = new Error("Subscription required");
//     err.status = 400;
//     throw err;
//   }

//   await PushSubscription.findOneAndUpdate(
//     { owner_id },
//     { subscription },
//     { upsert: true, new: true }
//   );

//   return { success: true };
// };

// module.exports = { saveSubscription };

// controllers/push.controller.js


const PushSubscription = require("../models/pushSubscription.model");

/**
 * 🔔 Save / Rebind subscription
 */
const saveSubscription = async (owner_id, deviceId, subscription) => {
  if (!deviceId || !subscription?.endpoint) {
    const err = new Error("Invalid subscription");
    err.status = 400;
    throw err;
  }

  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },   // 🔥 FIX
    {
      endpoint: subscription.endpoint,
      device_id: deviceId,
      owner_id,
      subscription,
      is_active: true,
      last_seen_at: new Date()
    },
    { upsert: true }
  );

  return { success: true };
};

/**
 * 🔕 Detach subscription (LOGOUT)
 */
const detachSubscription = async (deviceId) => {
  if (!deviceId) return;

  await PushSubscription.updateMany(
    { device_id: deviceId },
    {
      $set: {
        owner_id: null,
        is_active: false
      }
    }
  );
};

module.exports = {
  saveSubscription,
  detachSubscription
};
