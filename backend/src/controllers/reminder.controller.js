// const Reminder = require('../models/reminder.model');

// /**
//  * Create a new reminder
//  */
// const createReminder = async (reminderData) => {
//   const { owner_id, note, date } = reminderData;

//   if (!owner_id || !note || !date) {
//     const err = new Error('Owner ID, note, and date are required');
//     err.status = 400;
//     throw err;
//   }

//   const newReminder = new Reminder({
//     owner_id,
//     note,
//     date: new Date(date)
//   });

//   await newReminder.save();
//   return newReminder;
// };

// /**
//  * Get all reminders for owner with optional filters
//  */
// const getAllReminders = async (owner_id, filterParams = {}) => {
//   const { date, done, from_date, to_date } = filterParams;
//   const query = { owner_id };
  
//   // Filter by done status
//   if (done !== undefined) {
//     query.done = done === 'true' || done === true;
//   }
  
//   // Filter by specific date
//   if (date) {
//     const startDate = new Date(date);
//     startDate.setHours(0, 0, 0, 0);
    
//     const endDate = new Date(date);
//     endDate.setHours(23, 59, 59, 999);
    
//     query.date = { $gte: startDate, $lte: endDate };
//   }
  
//   // Filter by date range
//   if (from_date && to_date) {
//     const startDate = new Date(from_date);
//     startDate.setHours(0, 0, 0, 0);
    
//     const endDate = new Date(to_date);
//     endDate.setHours(23, 59, 59, 999);
    
//     query.date = { $gte: startDate, $lte: endDate };
//   } else if (from_date) {
//     const startDate = new Date(from_date);
//     startDate.setHours(0, 0, 0, 0);
//     query.date = { $gte: startDate };
//   } else if (to_date) {
//     const endDate = new Date(to_date);
//     endDate.setHours(23, 59, 59, 999);
//     query.date = { $lte: endDate };
//   }

//   const reminders = await Reminder.find(query)
//     .sort({ date: 1, createdAt: -1 });

//   return {
//     count: reminders.length,
//     reminders
//   };
// };

// /**
//  * Get reminder by ID
//  */
// const getReminderById = async (id, owner_id) => {
//   const reminder = await Reminder.findOne({ _id: id, owner_id });

//   if (!reminder) {
//     const err = new Error('Reminder not found');
//     err.status = 404;
//     throw err;
//   }
//   return reminder;
// };

// /**
//  * Update reminder
//  */
// const updateReminder = async (id, owner_id, updateData) => {
//   // If date is being updated, convert to Date object
//   if (updateData.date) {
//     updateData.date = new Date(updateData.date);
//   }

//   const updatedReminder = await Reminder.findOneAndUpdate(
//     { _id: id, owner_id },
//     updateData,
//     { new: true, runValidators: true }
//   );

//   if (!updatedReminder) {
//     const err = new Error('Reminder not found or update failed');
//     err.status = 404;
//     throw err;
//   }
//   return updatedReminder;
// };

// /**
//  * Delete reminder
//  */
// const deleteReminder = async (id, owner_id) => {
//   const deletedReminder = await Reminder.findOneAndDelete({ _id: id, owner_id });

//   if (!deletedReminder) {
//     const err = new Error('Reminder not found or delete failed');
//     err.status = 404;
//     throw err;
//   }
//   return { message: 'Reminder deleted successfully' };
// };

// /**
//  * Toggle reminder done status
//  */
// const toggleReminderStatus = async (id, owner_id, done) => {
//   const updatedReminder = await Reminder.findOneAndUpdate(
//     { _id: id, owner_id },
//     { done: done === true || done === 'true' },
//     { new: true, runValidators: true }
//   );

//   if (!updatedReminder) {
//     const err = new Error('Reminder not found or status update failed');
//     err.status = 404;
//     throw err;
//   }
//   return updatedReminder;
// };

// /**
//  * Get today's reminders
//  */
// const getTodaysReminders = async (owner_id) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
  
//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);

//   const reminders = await Reminder.find({
//     owner_id,
//     date: { $gte: today, $lt: tomorrow },
//     done: false
//   }).sort({ date: 1 });

//   return {
//     count: reminders.length,
//     reminders
//   };
// };

// module.exports = {
//   createReminder,
//   getAllReminders,
//   getReminderById,
//   updateReminder,
//   deleteReminder,
//   toggleReminderStatus,
//   getTodaysReminders
// };

const Reminder = require('../models/reminder.model');

/**
 * Create a new reminder
 */
const createReminder = async (reminderData) => {
  const { owner_id, note, date, sendWhatsapp } = reminderData;

  if (!owner_id || !note || !date) {
    const err = new Error('Owner ID, note, and date are required');
    err.status = 400;
    throw err;
  }

  const newReminder = new Reminder({
    owner_id,
    note,
    date: new Date(date),
    sendWhatsapp: sendWhatsapp !== undefined ? sendWhatsapp : true
  });

  await newReminder.save();
  return newReminder;
};

/**
 * Get all reminders for owner with optional filters
 */
const getAllReminders = async (owner_id, filterParams = {}) => {
  const { date, done, from_date, to_date } = filterParams;
  const query = { owner_id };
  
  // Filter by done status
  if (done !== undefined) {
    query.done = done === 'true' || done === true;
  }
  
  // Filter by specific date
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  // Filter by date range
  if (from_date && to_date) {
    const startDate = new Date(from_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(to_date);
    endDate.setHours(23, 59, 59, 999);
    
    query.date = { $gte: startDate, $lte: endDate };
  } else if (from_date) {
    const startDate = new Date(from_date);
    startDate.setHours(0, 0, 0, 0);
    query.date = { $gte: startDate };
  } else if (to_date) {
    const endDate = new Date(to_date);
    endDate.setHours(23, 59, 59, 999);
    query.date = { $lte: endDate };
  }

  const reminders = await Reminder.find(query)
    .sort({ date: 1, createdAt: -1 });

  return {
    count: reminders.length,
    reminders
  };
};

/**
 * Get reminder by ID
 */
const getReminderById = async (id, owner_id) => {
  const reminder = await Reminder.findOne({ _id: id, owner_id });

  if (!reminder) {
    const err = new Error('Reminder not found');
    err.status = 404;
    throw err;
  }
  return reminder;
};

/**
 * Update reminder
 * ⛔ LOCKED if: done = true OR whatsappSent = true
 */
const updateReminder = async (id, owner_id, updateData) => {
  // First check if reminder exists and if it's locked
  const existingReminder = await Reminder.findOne({ _id: id, owner_id });
  
  if (!existingReminder) {
    const err = new Error('Reminder not found');
    err.status = 404;
    throw err;
  }

  // ⛔ Check if reminder is locked
  if (existingReminder.done || existingReminder.whatsappSent) {
    const err = new Error('Cannot edit reminder: It has been completed or WhatsApp notification has been sent');
    err.status = 403;
    throw err;
  }

  // If date is being updated, convert to Date object
  if (updateData.date) {
    updateData.date = new Date(updateData.date);
  }

  const updatedReminder = await Reminder.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  );

  return updatedReminder;
};

/**
 * Delete reminder
 * ⛔ LOCKED if: done = true OR whatsappSent = true
 */
const deleteReminder = async (id, owner_id) => {
  // First check if reminder exists and if it's locked
  const existingReminder = await Reminder.findOne({ _id: id, owner_id });
  
  if (!existingReminder) {
    const err = new Error('Reminder not found');
    err.status = 404;
    throw err;
  }

  // ⛔ Check if reminder is locked
  if (existingReminder.done || existingReminder.whatsappSent) {
    const err = new Error('Cannot delete reminder: It has been completed or WhatsApp notification has been sent');
    err.status = 403;
    throw err;
  }

  await Reminder.findOneAndDelete({ _id: id, owner_id });
  return { message: 'Reminder deleted successfully' };
};

/**
 * Toggle reminder done status
 * ✅ CAN mark as done even if WhatsApp sent
 * ⛔ Cannot mark as NOT done once done = true
 */
const toggleReminderStatus = async (id, owner_id, done) => {
  // First check if reminder exists and current status
  const existingReminder = await Reminder.findOne({ _id: id, owner_id });
  
  if (!existingReminder) {
    const err = new Error('Reminder not found');
    err.status = 404;
    throw err;
  }

  const isDoneValue = done === true || done === 'true';

  // ⛔ Cannot mark as NOT done once it's done
  if (existingReminder.done && !isDoneValue) {
    const err = new Error('Cannot mark as pending: Reminder has already been completed');
    err.status = 403;
    throw err;
  }

  // ✅ Allow marking as done even if WhatsApp was sent
  const updatedReminder = await Reminder.findOneAndUpdate(
    { _id: id, owner_id },
    { done: isDoneValue },
    { new: true, runValidators: true }
  );

  return updatedReminder;
};

/**
 * Get today's reminders
 */
const getTodaysReminders = async (owner_id) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const reminders = await Reminder.find({
    owner_id,
    date: { $gte: today, $lt: tomorrow },
    done: false,
    whatsappSent: false
  }).sort({ date: 1 });

  return {
    count: reminders.length,
    reminders
  };
};

module.exports = {
  createReminder,
  getAllReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  toggleReminderStatus,
  getTodaysReminders
};