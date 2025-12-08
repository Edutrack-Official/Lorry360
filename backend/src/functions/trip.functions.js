  const { app } = require('@azure/functions');
  const connectDB = require('../utils/db');
  const {
    createTrip,
    getAllTrips,
    getCollaborativeTripsForMe,
    getTripById,
    getCollaborativeTripById,
    updateTrip,
    deleteTrip,
    updateTripStatus,
    getTripStats,
    getTripsAnalytics,
    getTripFormData,
    getTripsByCrusherId,
    getTripsByCustomerId,
    cloneTrips
  } = require('../controllers/trip.controller');
  const { verifyToken } = require('../middleware/auth.middleware');
  const { log } = require('console');
  const { getInvoiceData } = require('../controllers/trip.controller');

  /**
   * ✅ Create Trip (Customer or Collaborative)
   */
  app.http('createTrip', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'trips/create',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);
        log('User decoded:', user);

        // Only owners can create trips
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const body = await request.json();
        body.owner_id = user.userId; // Set owner from token

        const result = await createTrip(body);
        
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
   * ✅ Get All Trips for Owner (with filters)
   */
app.http('getAllTrips', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their trips
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      // Convert URLSearchParams → plain object
      const filterParams = Object.fromEntries(request.query.entries());

      console.log("Trip Filter Params:", filterParams);

      const result = await getAllTrips(user.userId, filterParams);

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
   * ✅ Get Collaborative Trips For Me (trips delivered to me)
   */
  app.http('getCollaborativeTripsForMe', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'trips/collaborative/for-me',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);

        // Only owners can view collaborative trips
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const filterParams = request.query;
        const result = await getCollaborativeTripsForMe(user.userId, filterParams);

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
   * ✅ Get Trip by ID (My trips)
   */
  app.http('getTripById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'trips/{tripId}',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);

        // Only owners can view their trips
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const { tripId } = request.params;
        const result = await getTripById(tripId, user.userId);

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
   * ✅ Get Collaborative Trip by ID (trips delivered to me)
   */
  app.http('getCollaborativeTripById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'trips/collaborative/{tripId}',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);

        // Only owners can view collaborative trips
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const { tripId } = request.params;
        const result = await getCollaborativeTripById(tripId, user.userId);

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
   * ✅ Update Trip
   */
  app.http('updateTrip', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'trips/update/{tripId}',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);

        // Only owners can update their trips
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const { tripId } = request.params;
        const body = await request.json();

        const result = await updateTrip(tripId, user.userId, body);

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
   * ✅ Delete Trip
   */
  app.http('deleteTrip', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'trips/delete/{tripId}',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);

        // Only owners can delete their trips
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const { tripId } = request.params;
        const result = await deleteTrip(tripId, user.userId);

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
   * ✅ Update Trip Status
   */
  app.http('updateTripStatus', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'trips/status/{tripId}',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);

        // Only owners can update trip status
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const { tripId } = request.params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
          return {
            status: 400,
            jsonBody: { success: false, error: 'Status is required' },
          };
        }

        const result = await updateTripStatus(tripId, user.userId, status);

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
   * ✅ Get Trip Statistics
   */
  app.http('getTripStats', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'trips/stats/{period}',
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
        const result = await getTripStats(user.userId, period);

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
   * ✅ Get Trips Analytics with Date Range
   */
  app.http('getTripsAnalytics', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'trips/analytics',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);

        // Only owners can view analytics
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const { start_date, end_date } = request.query;
        
        if (!start_date || !end_date) {
          return {
            status: 400,
            jsonBody: { success: false, error: 'start_date and end_date are required' },
          };
        }

        const result = await getTripsAnalytics(user.userId, start_date, end_date);

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
   * ✅ Get Trip Form Data (Customers, Drivers, Crushers, Lorries, Collaborative Owners)
   */
  app.http('getTripFormData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'form-data/trips',
    handler: async (request) => {
      try {
        await connectDB();
        
        const { decoded: user, newAccessToken } = await verifyToken(request);

        // Only owners can access form data
        if (user.role !== 'owner') {
          return {
            status: 403,
            jsonBody: { success: false, error: 'Access denied. Owner role required.' },
          };
        }

        const result = await getTripFormData(user.userId);

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
 * ✅ Get All Trips by Customer ID (with owner security)
 */
app.http('getTripsByCustomerId', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips/customer/{customerId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can access this
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { customerId } = request.params;
      const filterParams = request.query;
      
      // Pass owner_id as first parameter for security
      const result = await getTripsByCustomerId(user.userId, customerId, filterParams);

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
 * ✅ Get All Trips by Crusher ID (with owner security)
 */
app.http('getTripsByCrusherId', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips/crusher/{crusherId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can access this
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { crusherId } = request.params;
      const filterParams = request.query;
      
      // Pass owner_id as first parameter for security
      const result = await getTripsByCrusherId(user.userId, crusherId, filterParams);

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
 * ✅ Get Invoice Data for Customer
 */
app.http('getInvoiceData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips/invoice-data',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can access invoice data
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

  const url = new URL(request.url);
  const customer_id = url.searchParams.get('customer_id');
  const from_date = url.searchParams.get('from_date');
  const to_date = url.searchParams.get('to_date');
      
      // Validate required parameters
      if (!customer_id || !from_date || !to_date) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Customer ID, from date and to date are required' 
          },
        };
      }

      const result = await getInvoiceData(user.userId, customer_id, from_date, to_date);

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result 
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { 
          success: false, 
          error: err.message 
        },
      };
    }
  },
});


/**
 * ✅ Clone Trip (Create multiple copies of a trip)
 */
app.http('cloneTrips', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'trips/clone',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can clone trips
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      const { 
        tripIds, 
        times = 1, 
        resetStatus = false,
        resetDate = false,
        newTripDate = null
      } = body;

      // Validate input
      if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'tripIds must be a non-empty array' },
        };
      }

      if (!times || typeof times !== 'number' || times < 1 || times > 100) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Number of clones must be a number between 1 and 100' },
        };
      }

      // Validate resetDate and newTripDate
      if (resetDate === true && !newTripDate) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'newTripDate is required when resetDate is true' 
          },
        };
      }

      // Validate newTripDate format if provided
      if (newTripDate) {
        const dateObj = new Date(newTripDate);
        if (isNaN(dateObj.getTime())) {
          return {
            status: 400,
            jsonBody: { 
              success: false, 
              error: 'newTripDate must be a valid date string' 
            },
          };
        }
      }

      // Prepare options object
      const options = {
        resetStatus,
        resetDate,
        newTripDate: newTripDate ? new Date(newTripDate) : null
      };

      // Pass the array to controller
      const result = await cloneTrips(tripIds, user.userId, times, options);

      const response = { 
        status: 201, 
        jsonBody: { 
          success: true,
          data: result
        } 
      };
      
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