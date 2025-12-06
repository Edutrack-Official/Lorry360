// const { app } = require('@azure/functions');
// const connectDB = require('../utils/db');
// const {
//   createPayment,
//   getAllPayments,
//   getPaymentById,
//   updatePayment,
//   deletePayment,
//   getPaymentStats,
//   getPaymentsByCrusher,
//   getPaymentsByCustomer
// } = require('../controllers/payment.controller');
// const { verifyToken } = require('../middleware/auth.middleware');

// /**
//  * ✅ Create Payment (Both to crusher and from customer)
//  */
// app.http('createPayment', {
//   methods: ['POST'],
//   authLevel: 'anonymous',
//   route: 'payments/create',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can create payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const body = await request.json();
//       body.owner_id = user.userId; // Set owner from token

//       const result = await createPayment(body);
      
//       const response = { status: 201, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get All Payments for Owner
//  */
// app.http('getAllPayments', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'payments',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const filterParams = request.query;
//       const result = await getAllPayments(user.userId, filterParams);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get Payment by ID
//  */
// app.http('getPaymentById', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'payments/{paymentId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { paymentId } = request.params;
//       const result = await getPaymentById(paymentId, user.userId);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Update Payment
//  */
// app.http('updatePayment', {
//   methods: ['PUT'],
//   authLevel: 'anonymous',
//   route: 'payments/update/{paymentId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can update their payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { paymentId } = request.params;
//       const body = await request.json();

//       const result = await updatePayment(paymentId, user.userId, body);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get Payment Statistics
//  */
// app.http('getPaymentStats', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'payments/stats/{period}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view stats
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { period } = request.params;
//       const result = await getPaymentStats(user.userId, period);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get Payments by Crusher
//  */
// app.http('getPaymentsByCrusher', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'payments/crusher/{crusherId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { crusherId } = request.params;
//       const result = await getPaymentsByCrusher(user.userId, crusherId);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get Payments by Customer
//  */
// app.http('getPaymentsByCustomer', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'payments/customer/{customerId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { customerId } = request.params;
//       const result = await getPaymentsByCustomer(user.userId, customerId);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get All Crusher Payments (Outgoing)
//  */
// app.http('getCrusherPayments', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'payments/type/crusher',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const filterParams = { ...request.query, payment_type: 'to_crusher' };
//       const result = await getAllPayments(user.userId, filterParams);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get All Customer Payments (Incoming)
//  */
// app.http('getCustomerPayments', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'payments/type/customer',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const filterParams = { ...request.query, payment_type: 'from_customer' };
//       const result = await getAllPayments(user.userId, filterParams);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Delete Payment (Soft Delete)
//  */
// app.http('deletePayment', {
//   methods: ['DELETE'],
//   authLevel: 'anonymous',
//   route: 'payments/delete/{paymentId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can delete their payments
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { paymentId } = request.params;
      
//       // Use the deletePayment function from your controller
//       const result = await deletePayment(paymentId, user.userId);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updateCollabPaymentStatus,
  deletePayment,
  getPaymentStats,
  getPaymentsByCrusher,
  getPaymentsByCustomer,
  getCollabPaymentsForOwner
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

      // Only owners can create payments
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      body.owner_id = user.userId; // Set owner from token

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
 * ✅ Get All Payments for Owner (Now includes collab payments)
 */
app.http('getAllPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their payments
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

/**
 * ✅ Get Payment by ID
 */
app.http('getPaymentById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/{paymentId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their payments
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { paymentId } = request.params;
      const result = await getPaymentById(paymentId, user.userId);

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
 * ✅ Update Payment
 */
app.http('updatePayment', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'payments/update/{paymentId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can update their payments
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
 * ✅ Update Collaboration Payment Status (Approved/Rejected by Collab Owner)
 */
app.http('updateCollabPaymentStatus', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'payments/collab/{paymentId}/status',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can update payment status
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

      // user.userId is the collab owner approving/rejecting
      // body.owner_id is the original payment owner
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

/**
 * ✅ Get Collaboration Payments for Specific Partner
 */
app.http('getCollabPaymentsForOwner', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/collab/{collabOwnerId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their collab payments
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
 * ✅ Get All Collaboration Payments (Outgoing to partners)
 */
app.http('getCollabPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/type/collab',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their payments
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
 * ✅ Get Payment Statistics
 */
app.http('getPaymentStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/stats/{period}',
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
 * ✅ Get Payments by Crusher
 */
app.http('getPaymentsByCrusher', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/crusher/{crusherId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their payments
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { crusherId } = request.params;
      const result = await getPaymentsByCrusher(user.userId, crusherId);

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
 * ✅ Get Payments by Customer
 */
app.http('getPaymentsByCustomer', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/customer/{customerId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their payments
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { customerId } = request.params;
      const result = await getPaymentsByCustomer(user.userId, customerId);

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
 * ✅ Get All Crusher Payments (Outgoing)
 */
app.http('getCrusherPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/type/crusher',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their payments
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
 * ✅ Get All Customer Payments (Incoming)
 */
app.http('getCustomerPayments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'payments/type/customer',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their payments
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
 * ✅ Delete Payment (Soft Delete)
 */
app.http('deletePayment', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'payments/delete/{paymentId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can delete their payments
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