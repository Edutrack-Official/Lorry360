const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updateCollabPaymentStatus,
  deletePayment,
  bulkSoftDeletePayments,  // ← ADDED
  getPaymentStats,
  getPaymentsByCrusher,
  getPaymentsByCustomer,
  getPaymentsByBunk,        // ← ADDED
  getCollabPaymentsForOwner,
  getPaymentsAsReceiver,
  getMyPaymentsToPartner
} = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * ✅ Create Payment (Both to crusher and from customer AND to_collab_owner)
 */
app.http('createPayment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'payments/create',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      body.owner_id = user.userId;

      const result = await createPayment(body);
      
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
 * ✅ Get All Payments for Owner
 */
app.http('getAllPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = request.query;
      const result = await getAllPayments(user.userId, filterParams);

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

// ============================================
// ⚠️ CRITICAL: SPECIFIC ROUTES MUST COME BEFORE GENERIC {paymentId} ROUTES
// ============================================

/**
 * ✅ Get Payments Where I Am Receiver - WORKAROUND: Using hyphen instead of slash
 */
app.http('getPaymentsAsReceiver', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments-received',  // ← CHANGED: Using hyphen to avoid route conflict
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied.' },
        };
      }

      const filterParams = request.query;
      const result = await getPaymentsAsReceiver(user.userId, filterParams);

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
 * ✅ Bulk Soft Delete Payments
 */
app.http('bulkSoftDeletePayments', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'payments/bulk-delete',  // ← New endpoint
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      const { paymentIds } = body;

      if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'paymentIds must be a non-empty array' },
        };
      }

      const result = await bulkSoftDeletePayments(paymentIds, user.userId);

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
 * ✅ Get Payment Statistics - MUST BE BEFORE getPaymentById!
 */
app.http('getPaymentStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/stats/{period}',  // ← Specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { period } = request.params;
      const result = await getPaymentStats(user.userId, period);

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
 * ✅ Get Payments by Crusher - MUST BE BEFORE getPaymentById!
 */
app.http('getPaymentsByCrusher', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/crusher/{crusherId}',  // ← Specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { crusherId } = request.params;
      const filterParams = request.query;
      const result = await getPaymentsByCrusher(user.userId, crusherId, filterParams);

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
 * ✅ Get Payments by Customer - MUST BE BEFORE getPaymentById!
 */
app.http('getPaymentsByCustomer', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/customer/{customerId}',  // ← Specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { customerId } = request.params;
      const filterParams = request.query;
      const result = await getPaymentsByCustomer(user.userId, customerId, filterParams);

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
 * ✅ Get Payments by Bunk - MUST BE BEFORE getPaymentById! (NEW)
 */
app.http('getPaymentsByBunk', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/bunk/{bunkId}',  // ← New specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { bunkId } = request.params;
      const filterParams = request.query;
      const result = await getPaymentsByBunk(user.userId, bunkId, filterParams);

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
 * ✅ Get All Collaboration Payments - MUST BE BEFORE getPaymentById!
 */
app.http('getCollabPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/type/collab',  // ← Specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = { ...request.query, payment_type: 'to_collab_owner' };
      const result = await getAllPayments(user.userId, filterParams);

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
 * ✅ Get All Crusher Payments - MUST BE BEFORE getPaymentById!
 */
app.http('getCrusherPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/type/crusher',  // ← Specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = { ...request.query, payment_type: 'to_crusher' };
      const result = await getAllPayments(user.userId, filterParams);

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
 * ✅ Get All Customer Payments - MUST BE BEFORE getPaymentById!
 */
app.http('getCustomerPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/type/customer',  // ← Specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = { ...request.query, payment_type: 'from_customer' };
      const result = await getAllPayments(user.userId, filterParams);

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
 * ✅ Get All Bunk Payments - MUST BE BEFORE getPaymentById! (NEW)
 */
app.http('getBunkPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/type/bunk',  // ← New specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = { ...request.query, payment_type: 'to_bunk' };
      const result = await getAllPayments(user.userId, filterParams);

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
 * ✅ Get Collaboration Payments for Specific Partner - MUST BE BEFORE getPaymentById!
 */
app.http('getCollabPaymentsForOwner', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/collab/{collabOwnerId}',  // ← Specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { collabOwnerId } = request.params;
      const filterParams = request.query;
      
      const result = await getCollabPaymentsForOwner(user.userId, collabOwnerId, filterParams);

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
 * ✅ Update Payment - MUST BE BEFORE getPaymentById!
 */
app.http('updatePayment', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'payments/update/{paymentId}',  // ← Specific route pattern
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { paymentId } = request.params;
      const body = await request.json();

      const result = await updatePayment(paymentId, user.userId, body);

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
 * ✅ Delete Payment - MUST BE BEFORE getPaymentById!
 */
app.http('deletePayment', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'payments/delete/{paymentId}',  // ← Specific route pattern
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { paymentId } = request.params;
      
      const result = await deletePayment(paymentId, user.userId);

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
 * ✅ Update Collaboration Payment Status - MUST BE BEFORE getPaymentById!
 */
app.http('updateCollabPaymentStatus', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'payments/collab/{paymentId}/status',  // ← Specific route pattern
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { paymentId } = request.params;
      const body = await request.json();
      
      if (!body.status || !body.owner_id) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Status and owner_id are required' },
        };
      }

      const result = await updateCollabPaymentStatus(paymentId, body.owner_id, user.userId, body.status);

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

app.http('getMyPaymentsToPartner', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/to-partner/{partnerId}',  // ← Specific route
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied.' },
        };
      }

      const { partnerId } = request.params;
      const filterParams = request.query;
      
      console.log('🔍 getMyPaymentsToPartner endpoint called');
      console.log('📍 partnerId:', partnerId);
      console.log('📍 user.userId:', user.userId);
      
      const result = await getMyPaymentsToPartner(user.userId, partnerId, filterParams);

      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      console.error('❌ Error in getMyPaymentsToPartner:', err);
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

// ============================================
// ⚠️ GENERIC ROUTES MUST COME LAST
// ============================================

/**
 * ✅ Get Payment by ID - MUST BE LAST!
 */
app.http('getPaymentById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/{paymentId}',  // ← Generic route (catches everything)
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { paymentId } = request.params;
      const include_inactive = request.query.include_inactive === 'true';
      const result = await getPaymentById(paymentId, user.userId, include_inactive);

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