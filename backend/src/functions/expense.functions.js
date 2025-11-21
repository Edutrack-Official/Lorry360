const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getExpensesByLorry
} = require('../controllers/expense.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * ✅ Create Expense
 */
app.http('createExpense', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'expenses/create',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can create expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      body.owner_id = user.userId; // Set owner from token

      const result = await createExpense(body);
      
      const response = { status: 201, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
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
 * ✅ Get All Expenses for Owner
 */
app.http('getAllExpenses', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = request.query;
      const result = await getAllExpenses(user.userId, filterParams);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
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
 * ✅ Get Expense by ID
 */
app.http('getExpenseById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses/{expenseId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { expenseId } = request.params;
      const result = await getExpenseById(expenseId, user.userId);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
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
 * ✅ Update Expense
 */
app.http('updateExpense', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'expenses/update/{expenseId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can update their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { expenseId } = request.params;
      const body = await request.json();

      const result = await updateExpense(expenseId, user.userId, body);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
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
 * ✅ Delete Expense
 */
app.http('deleteExpense', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'expenses/delete/{expenseId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can delete their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { expenseId } = request.params;
      const result = await deleteExpense(expenseId, user.userId);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
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
 * ✅ Get Expense Statistics
 */
app.http('getExpenseStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses/stats/{period}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view stats
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { period } = request.params;
      const result = await getExpenseStats(user.userId, period);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
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
 * ✅ Get Expenses by Lorry
 */
app.http('getExpensesByLorry', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses/lorry/{lorryId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { lorryId } = request.params;
      const result = await getExpensesByLorry(user.userId, lorryId);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});