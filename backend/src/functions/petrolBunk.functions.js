const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  createPetrolBunk,
  getAllPetrolBunks,
  getPetrolBunkById,
  updatePetrolBunk,
  deletePetrolBunk,
  bulkSoftDeletePetrolBunks
} = require('../controllers/petrolBunk.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * ✅ Create Petrol Bunk
 */
app.http('createPetrolBunk', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'petrol-bunks/create',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can create petrol bunks
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      body.owner_id = user.userId; // Set owner from token

      const result = await createPetrolBunk(body);
      
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
 * ✅ Get All Petrol Bunks for Owner
 */
app.http('getAllPetrolBunks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'petrol-bunks',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their petrol bunks
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { include_inactive } = request.query;
      
      const result = await getAllPetrolBunks(
        user.userId, 
        include_inactive === 'true'
      );

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
 * ✅ Get Petrol Bunk by ID
 */
app.http('getPetrolBunkById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'petrol-bunks/{bunkId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their petrol bunks
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { bunkId } = request.params;
      const { include_inactive } = request.query;
      
      const result = await getPetrolBunkById(
        bunkId, 
        user.userId,
        include_inactive === 'true'
      );

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
 * ✅ Update Petrol Bunk
 */
app.http('updatePetrolBunk', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'petrol-bunks/update/{bunkId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can update their petrol bunks
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { bunkId } = request.params;
      const body = await request.json();

      const result = await updatePetrolBunk(bunkId, user.userId, body);

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
 * ✅ Delete Petrol Bunk (Soft Delete)
 */
app.http('deletePetrolBunk', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'petrol-bunks/delete/{bunkId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can delete their petrol bunks
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { bunkId } = request.params;
      const result = await deletePetrolBunk(bunkId, user.userId);

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
 * ✅ Bulk Soft Delete Petrol Bunks
 */
app.http('bulkSoftDeletePetrolBunks', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'petrol-bunks/bulk-delete',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can delete their petrol bunks
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      const { bunkIds } = body;

      // Validate input
      if (!bunkIds || !Array.isArray(bunkIds) || bunkIds.length === 0) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'bunkIds must be a non-empty array' },
        };
      }

      const result = await bulkSoftDeletePetrolBunks(bunkIds, user.userId);

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
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});