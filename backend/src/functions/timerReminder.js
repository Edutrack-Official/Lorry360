const { app } = require("@azure/functions");
const reminderScheduler = require("./reminderScheduler");

const schedule =
  process.env.REMINDER_TIMER_SCHEDULE || "0 0 6 * * *"; // fallback

app.timer("ReminderTimer", {
  schedule,
  handler: async () => {
    console.log("Running Reminder Scheduler...");
    console.log("Schedule:", schedule);
    await reminderScheduler();
  }
});
