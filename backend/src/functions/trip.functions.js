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
    cloneTrips,
    bulkSoftDeleteTrips,
    updateTripPricesForMultipleTrips,
    bulkUpdateTripStatus,
    updateCollabTripStatus,
    getGSTInvoiceData
  } = require('../controllers/trip.controller');
  const { verifyToken } = require('../middleware/auth.middleware');
  const { log } = require('console');
  const { getInvoiceData,getCollaborationInvoiceData } = require('../controllers/trip.controller');

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

  app.http('updateCollabTripStatus', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'trips/collab/{tripId}/status',
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

      const { tripId } = request.params;
      const body = await request.json();
      
      if (!body.status || !body.collab_owner_id) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Status and collab_owner_id are required' 
          },
        };
      }

      const result = await updateCollabTripStatus(
        tripId, 
        body.collab_owner_id, 
        user.userId, 
        body.status
      );

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


app.http('getCrusherInvoiceData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips/crusher-invoice-data',
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
      const crusher_id = url.searchParams.get('crusher_id');
      const from_date = url.searchParams.get('from_date');
      const to_date = url.searchParams.get('to_date');
      const include_inactive = url.searchParams.get('include_inactive') === 'true';
      
      // Validate required parameters
      if (!crusher_id || !from_date || !to_date) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Crusher ID, from date and to date are required' 
          },
        };
      }

      // Validate date format
      if (isNaN(new Date(from_date)) || isNaN(new Date(to_date))) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Invalid date format. Use YYYY-MM-DD format' 
          },
        };
      }

      // Validate from_date is not after to_date
      if (new Date(from_date) > new Date(to_date)) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'From date cannot be after to date' 
          },
        };
      }

      const result = await getCrusherInvoiceData(
        user.userId, 
        crusher_id, 
        from_date, 
        to_date,
        include_inactive
      );

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
      console.error('Crusher invoice error:', err);
      return {
        status: err.status || 500,
        jsonBody: { 
          success: false, 
          error: err.message || 'Failed to generate crusher invoice data' 
        },
      };
    }
  },
});

app.http('getCollaborationInvoiceData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips/collaboration-invoice-data',
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
      const partner_owner_id = url.searchParams.get('partner_owner_id');
      const from_date = url.searchParams.get('from_date');
      const to_date = url.searchParams.get('to_date');
      const include_inactive = url.searchParams.get('include_inactive') === 'true';
      
      // Validate required parameters
      if (!partner_owner_id || !from_date || !to_date) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Partner owner ID, from date and to date are required' 
          },
        };
      }

      const result = await getCollaborationInvoiceData(user.userId, partner_owner_id, from_date, to_date, include_inactive);

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

/**
 * ✅ Bulk Soft Delete Trips (Simple)
 */
app.http('bulkSoftDeleteTrips', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'trips/bulk-soft-delete',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can delete trips
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { 
            success: false, 
            error: 'Access denied. Owner role required.' 
          },
        };
      }

      const body = await request.json();
      const { tripIds } = body;

      // Validate input
      if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'tripIds must be a non-empty array' 
          },
        };
      }

      // Call the simple bulk soft delete function
      const result = await bulkSoftDeleteTrips(tripIds, user.userId);

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


app.http('updateTripPrices', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'trips/update-prices',
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
      const { tripIds, update_customer_amount = false, extra_amount = 0 } = body;

      const result = await updateTripPricesForMultipleTrips(user.userId, {
        tripIds,
        update_customer_amount,
        extra_amount
      });

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


app.http('bulkUpdateTripStatus', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'trips/bulk-update-status',
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
      const { tripIds, status } = body;

      // Validate input
      if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'tripIds must be a non-empty array' 
          },
        };
      }

      if (!status || typeof status !== 'string') {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'status is required' 
          },
        };
      }

      // Validate status value
      const validStatuses = ['scheduled', 'dispatched', 'loaded', 'in_transit', 'delivered', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
          },
        };
      }

      // Check if trying to update too many trips at once (optional)
      if (tripIds.length > 100) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Cannot update more than 100 trips at once. Please select fewer trips.' 
          },
        };
      }

      // Call the bulk update function
      const result = await bulkUpdateTripStatus(user.userId, {
        tripIds,
        status
      });

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
 * ✅ Get GST Invoice Data for Customer
 */
app.http('getGSTInvoiceData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips/gst-invoice-data',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can access GST invoice data
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      // Get query parameters
      const url = new URL(request.url);
      const customer_id = url.searchParams.get('customer_id');
      const from_date = url.searchParams.get('from_date');
      const to_date = url.searchParams.get('to_date');
      const include_inactive = url.searchParams.get('include_inactive') === 'true';
      
      // Validate required parameters
      if (!from_date || !to_date) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'From date and to date are required' 
          },
        };
      }

      // Validate date format
      if (isNaN(new Date(from_date)) || isNaN(new Date(to_date))) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Invalid date format. Use YYYY-MM-DD format' 
          },
        };
      }

      // Validate from_date is not after to_date
      if (new Date(from_date) > new Date(to_date)) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'From date cannot be after to date' 
          },
        };
      }

      // Call GST invoice function (customer_id is optional - if not provided, get all customers)
      const result = await getGSTInvoiceData(
        user.userId, 
        from_date, 
        to_date,
        customer_id,  // This can be null for all customers
        include_inactive
      );

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
      console.error('GST invoice error:', err);
      return {
        status: err.status || 500,
        jsonBody: { 
          success: false, 
          error: err.message || 'Failed to generate GST invoice data' 
        },
      };
    }
  },
});