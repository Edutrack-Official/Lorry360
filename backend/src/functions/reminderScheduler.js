
process.env.TZ = "Asia/Kolkata";

const connectDB = require("../utils/db");
const Reminder = require("../models/reminder.model");
const PushSubscription = require("../models/pushSubscription.model");
const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:support@luma.app",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function reminderScheduler() {
  console.log("⏰ Daily Reminder Scheduler Started...");
  await connectDB();

  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59
  );

  const reminders = await Reminder.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    done: false,
    whatsappSent: false,
    sendWhatsapp: true
  });

  console.log(`📌 Today's Reminders Found: ${reminders.length}`);

  for (const reminder of reminders) {
    try {
      const sub = await PushSubscription.findOne({
        owner_id: reminder.owner_id
      });

      if (!sub) continue;

   await webpush.sendNotification(
    sub.subscription,
    JSON.stringify({
      title: "🔔 Luma Reminder",
      body: `${reminder.note}\n\n— Team Luma App`,

      vibrate: [200, 100, 200],   

      data: {
        url: "/reminders"
      }
    })
  );
      reminder.whatsappSent = true;
      reminder.whatsappSentAt = new Date();
      await reminder.save();

      console.log("✅ Push Sent:", reminder.owner_id);

    } catch (err) {
      console.error("❌ Push Failed:", err.message);
    }
  }
}

module.exports = reminderScheduler;
