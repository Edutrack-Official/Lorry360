const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  createReminder,
  getAllReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  toggleReminderStatus,
  getTodaysReminders
} = require('../controllers/reminder.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Common handler wrapper
const withAuth = async (request, handler) => {
  await connectDB();
  const { decoded: user, newAccessToken } = await verifyToken(request);
  return { user, newAccessToken };
};

/**
 * ✅ Create Reminder
 */
app.http('createReminder', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'reminders',
  handler: async (request) => {
    try {
      const { user, newAccessToken } = await withAuth(request);

      const body = await request.json();
      body.owner_id = user.userId;

      const result = await createReminder(body);

      const response = { status: 201, jsonBody: { success: true, data: result } };
      if (newAccessToken) response.jsonBody.newAccessToken = newAccessToken;
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Get All Reminders with filters
 */
app.http('getAllReminders', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reminders',
  handler: async (request) => {
    try {
      const { user, newAccessToken } = await withAuth(request);

      const filterParams = request.query;
      const result = await getAllReminders(user.userId, filterParams);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) response.jsonBody.newAccessToken = newAccessToken;
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ⬆️ IMPORTANT: place this before /reminders/{id}
 * ✅ Get Today's Reminders
 */
app.http('getTodaysReminders', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reminders/filter/today',
  handler: async (request) => {
    try {
      const { user, newAccessToken } = await withAuth(request);

      const result = await getTodaysReminders(user.userId);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) response.jsonBody.newAccessToken = newAccessToken;
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ⬇️ This must come AFTER /today
 * ✅ Get Single Reminder
 */
app.http('getReminderById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reminders/{id}',
  handler: async (request) => {
    try {
      const { user, newAccessToken } = await withAuth(request);
      const { id } = request.params;

      const result = await getReminderById(id, user.userId);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) response.jsonBody.newAccessToken = newAccessToken;
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Update Reminder
 */
app.http('updateReminder', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'reminders/{id}',
  handler: async (request) => {
    try {
      const { user, newAccessToken } = await withAuth(request);
      const { id } = request.params;
      const body = await request.json();

      const result = await updateReminder(id, user.userId, body);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) response.jsonBody.newAccessToken = newAccessToken;
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Delete Reminder
 */
app.http('deleteReminder', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'reminders/{id}',
  handler: async (request) => {
    try {
      const { user, newAccessToken } = await withAuth(request);
      const { id } = request.params;

      const result = await deleteReminder(id, user.userId);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) response.jsonBody.newAccessToken = newAccessToken;
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Toggle Reminder Status
 */
app.http('toggleReminderStatus', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'reminders/{id}/status',
  handler: async (request) => {
    try {
      const { user, newAccessToken } = await withAuth(request);
      const { id } = request.params;
      const body = await request.json();
      const { done } = body;

      if (done === undefined) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Done status is required' },
        };
      }

      const result = await toggleReminderStatus(id, user.userId, done);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) response.jsonBody.newAccessToken = newAccessToken;
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

module.exports = {
  createReminder,
  getAllReminders,
  getTodaysReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  toggleReminderStatus
};
