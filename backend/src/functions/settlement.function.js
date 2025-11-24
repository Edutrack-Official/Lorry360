const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  calculateNetSettlement,
  createSettlement,
  getAllSettlements,
  getSettlementById,
  addPayment,
  approvePayment,
  rejectPayment,
  getSettlementStats,
  getCollaborativePartners
} = require('../controllers/settlement.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * ✅ Calculate Net Settlement
 */
app.http('calculateNetSettlement', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'settlements/calculate',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can calculate settlements
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      const { owner_B_id, from_date, to_date } = body;

      if (!owner_B_id || !from_date || !to_date) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'owner_B_id, from_date and to_date are required' },
        };
      }

      const result = await calculateNetSettlement(user.userId, owner_B_id, from_date, to_date);

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
 * ✅ Create Settlement
 */
app.http('createSettlement', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'settlements/create',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can create settlements
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      body.owner_A_id = user.userId; // Set owner A from token

      const result = await createSettlement(body);

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
 * ✅ Get All Settlements
 */
app.http('getAllSettlements', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'settlements',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view settlements
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = request.query;
      const result = await getAllSettlements(user.userId, filterParams);

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
 * ✅ Get Settlement by ID
 */
app.http('getSettlementById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'settlements/{settlementId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view settlements
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { settlementId } = request.params;
      const result = await getSettlementById(settlementId, user.userId);

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
 * ✅ Add Payment to Settlement
 */
app.http('addPayment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'settlements/{settlementId}/payments',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can add payments
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { settlementId } = request.params;
      const body = await request.json();

      const result = await addPayment(settlementId, body, user.userId);

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
 * ✅ Approve Payment
 */
app.http('approvePayment', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'settlements/{settlementId}/payments/{paymentIndex}/approve',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can approve payments
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { settlementId, paymentIndex } = request.params;
      const body = await request.json();

      const result = await approvePayment(settlementId, parseInt(paymentIndex), user.userId, body.notes);

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
 * ✅ Reject Payment
 */
app.http('rejectPayment', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'settlements/{settlementId}/payments/{paymentIndex}/reject',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can reject payments
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { settlementId, paymentIndex } = request.params;
      const body = await request.json();

      const result = await rejectPayment(settlementId, parseInt(paymentIndex), user.userId, body.rejection_reason);

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
 * ✅ Get Settlement Statistics
 */
app.http('getSettlementStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'settlements/stats/{period}',
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
      const result = await getSettlementStats(user.userId, period);

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
 * ✅ Get Collaborative Partners
 */
app.http('getCollaborativePartners', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'settlements/partners',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view partners
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const result = await getCollaborativePartners(user.userId);

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