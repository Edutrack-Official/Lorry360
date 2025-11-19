const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  createLorry,
  getAllLorries,
  getLorryById,
  updateLorry,
  deleteLorry,
  updateLorryStatus
} = require('../controllers/lorry.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * ✅ Create Lorry
 */
app.http('createLorry', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'lorries/create',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can create lorries
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      body.owner_id = user.userId; // Set owner from token

      const result = await createLorry(body);
      
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
 * ✅ Get All Lorries for Owner
 */
app.http('getAllLorries', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'lorries',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);
console.log('User decoded:', user);

      // Only owners can view their lorries
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = request.query;
      const result = await getAllLorries(user.userId, filterParams);

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
 * ✅ Get Lorry by ID
 */
app.http('getLorryById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'lorries/{lorryId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their lorries
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { lorryId } = request.params;
      const result = await getLorryById(lorryId, user.userId);

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
 * ✅ Update Lorry
 */
app.http('updateLorry', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'lorries/update/{lorryId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can update their lorries
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { lorryId } = request.params;
      const body = await request.json();

      const result = await updateLorry(lorryId, user.userId, body);

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
 * ✅ Delete Lorry
 */
app.http('deleteLorry', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'lorries/delete/{lorryId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can delete their lorries
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { lorryId } = request.params;
      const result = await deleteLorry(lorryId, user.userId);

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
 * ✅ Update Lorry Status
 */
app.http('updateLorryStatus', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'lorries/status/{lorryId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can update lorry status
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { lorryId } = request.params;
      const body = await request.json();
      const { status } = body;

      if (!status) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Status is required' },
        };
      }

      const result = await updateLorryStatus(lorryId, user.userId, status);

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