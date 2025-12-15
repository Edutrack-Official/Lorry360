const PushSubscription = require("../models/pushSubscription.model");

const saveSubscription = async (owner_id, subscription) => {
  if (!subscription) {
    const err = new Error("Subscription required");
    err.status = 400;
    throw err;
  }

  await PushSubscription.findOneAndUpdate(
    { owner_id },
    { subscription },
    { upsert: true, new: true }
  );

  return { success: true };
};

module.exports = { saveSubscription };
