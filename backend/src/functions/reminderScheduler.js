// const connectDB = require("../utils/db");
// const Reminder = require("../models/reminder.model");
// const User = require("../models/user.model");
// const sendWhatsapp = require("./sendWhatsapp");

// async function reminderScheduler() {

//   console.log("⏰ Reminder Scheduler Started...");
//   await connectDB();

//   const now = new Date();
//   const previousMinute = new Date(now);
//   previousMinute.setMinutes(previousMinute.getMinutes() - 1);

//   const reminders = await Reminder.find({
//     date: { $lte: now, $gte: previousMinute },
//     done: false,
//     whatsappSent: false,
//     sendWhatsapp: true
//   });

//   console.log(`📌 Reminders Found: ${reminders.length}`);

//   for (const reminder of reminders) {

//     try {
//       const user = await User.findById(reminder.owner_id);

//       if (!user || !user.phone) {
//         console.warn("⚠️ User not found or phone missing:", reminder.owner_id);
//         continue;
//       }

//       const formattedDate = new Date(reminder.date).toLocaleString("en-IN", {
//         dateStyle: "medium",
//         timeStyle: "short"
//       });

//       await sendWhatsapp(
//         user.phone,
//         user.name || "Customer",
//         reminder.note,
//         formattedDate
//       );

//       // ✅ Mark as Sent
//       reminder.whatsappSent = true;
//       reminder.whatsappSentAt = new Date();
//       await reminder.save();

//       console.log("✅ WhatsApp Sent to:", user.phone);

//     } catch (error) {
//       console.error("❌ WhatsApp Failed:", error.message);
//     }
//   }
// }

// module.exports = reminderScheduler;

const connectDB = require("../utils/db");
const Reminder = require("../models/reminder.model");
const User = require("../models/user.model");
const sendWhatsapp = require("./sendWhatsapp");

async function reminderScheduler() {

  console.log("⏰ Daily Reminder Scheduler Started...");
  await connectDB();

  const now = new Date();

  // Today 00:00:00
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Today 23:59:59
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
      const user = await User.findById(reminder.owner_id);

      if (!user || !user.phone) {
        console.warn("⚠️ User missing phone:", reminder.owner_id);
        continue;
      }

      const formattedDate = new Date(reminder.date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      await sendWhatsapp(
        user.phone,
        user.name || "Customer",
        reminder.note,
        formattedDate
      );

      reminder.whatsappSent = true;
      reminder.whatsappSentAt = new Date();
      await reminder.save();

      console.log("✅ WhatsApp Sent to:", user.phone);

    } catch (error) {
      console.error("❌ WhatsApp Failed:", error.message);
    }
  }
}

module.exports = reminderScheduler;