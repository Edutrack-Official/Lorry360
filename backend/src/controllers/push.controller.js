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


const PushSubscription = require("../models/pushSubscription.model");

/**
 * 🔔 Save / Rebind subscription (LOGIN)
 */
const saveSubscription = async (owner_id, deviceId, subscription) => {
  if (!deviceId || !subscription?.endpoint) {
    const err = new Error("Invalid subscription");
    err.status = 400;
    throw err;
  }

  await PushSubscription.findOneAndUpdate(
    { device_id: deviceId },   // 🔥 device identity
    {
      device_id: deviceId,
      owner_id,
      endpoint: subscription.endpoint,
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

  await PushSubscription.updateOne(
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
