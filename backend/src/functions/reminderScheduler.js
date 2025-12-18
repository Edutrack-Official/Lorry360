
// process.env.TZ = "Asia/Kolkata";

// const connectDB = require("../utils/db");
// const Reminder = require("../models/reminder.model");
// const PushSubscription = require("../models/pushSubscription.model");
// const webpush = require("web-push");

// webpush.setVapidDetails(
//   "mailto:support@luma.app",
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

// async function reminderScheduler() {
//   console.log("⏰ Daily Reminder Scheduler Started...");
//   await connectDB();

//   const now = new Date();

//   const startOfDay = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate()
//   );

//   const endOfDay = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate(),
//     23, 59, 59
//   );

//   const reminders = await Reminder.find({
//     date: { $gte: startOfDay, $lte: endOfDay },
//     done: false,
//     whatsappSent: false,
//     sendWhatsapp: true
//   });

//   console.log(`📌 Today's Reminders Found: ${reminders.length}`);

//   for (const reminder of reminders) {
//     try {
//       const sub = await PushSubscription.findOne({
//         owner_id: reminder.owner_id
//       });

//       if (!sub) continue;

//    await webpush.sendNotification(
//     sub.subscription,
//     JSON.stringify({
//       title: "🔔 Luma Reminder",
//       body: `${reminder.note}\n\n— Team Luma App`,

//       vibrate: [200, 100, 200],   

//       data: {
//         url: "/reminders"
//       }
//     })
//   );
//       reminder.whatsappSent = true;
//       reminder.whatsappSentAt = new Date();
//       await reminder.save();

//       console.log("✅ Push Sent:", reminder.owner_id);

//     } catch (err) {
//       console.error("❌ Push Failed:", err.message);
//     }
//   }
// }

// module.exports = reminderScheduler;
process.env.TZ = "Asia/Kolkata";

const connectDB = require("../utils/db");
const Reminder = require("../models/reminder.model");
const PushSubscription = require("../models/pushSubscription.model");
const webpush = require("web-push");

// 🔐 VAPID setup
webpush.setVapidDetails(
  "mailto:support@luma.app",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * ⏰ Daily Reminder Scheduler
 */
async function reminderScheduler() {
  console.log("⏰ Daily Reminder Scheduler Started...");
  await connectDB();

  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0
  );

  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59
  );

  // 📌 Fetch pending reminders (NOT sent yet)
  const reminders = await Reminder.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    done: false,
    sendWhatsapp: true,
    whatsappSent: false       // ✅ IMPORTANT
  });

  console.log(`📌 Today's Reminders Found: ${reminders.length}`);

  for (const reminder of reminders) {
    const devices = await PushSubscription.find({
      owner_id: reminder.owner_id,
      is_active: true
    });

    if (!devices.length) continue;

    let pushSent = false;

    for (const device of devices) {
      try {
        await webpush.sendNotification(
          device.subscription,
          JSON.stringify({
            title: "🔔 Luma Reminder",
            body: `${reminder.note}\n\n— Team Luma App`,
            vibrate: [200, 100, 200],
            data: {
              url: "/reminders",
              reminderId: reminder._id
            },
            tag: `reminder-${reminder._id}`
          })
        );

        console.log(
          `✅ Push sent → user:${reminder.owner_id} device:${device.device_id}`
        );

        pushSent = true;

      } catch (err) {
        console.error("❌ Push Failed:", err.message);

        // 🧹 Remove dead subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: device._id });
          console.log("🧹 Removed dead push subscription:", device.device_id);
        }
      }
    }

    // ✅ UPDATE REMINDER ONLY IF AT LEAST ONE PUSH SENT
    if (pushSent) {
      reminder.whatsappSent = true;
      reminder.whatsappSentAt = new Date();
      await reminder.save();

      console.log("📝 Reminder marked as sent:", reminder._id);
    }
  }
}

module.exports = reminderScheduler;
