const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  sendCollaborationRequest,
  getCollaborationRequests,
  getMySentRequests,
  getActiveCollaborations,
  acceptCollaboration,
  rejectCollaboration,
  cancelCollaborationRequest,
  endCollaboration,
  getCollaborationById,
  searchOwners
} = require('../controllers/collaboration.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * ✅ Send Collaboration Request
 */
app.http('sendCollaborationRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'collaborations/send-request',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can send collaboration requests
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const body = await request.json();
      body.from_owner_id = user.userId; // Set sender from token

      const result = await sendCollaborationRequest(body);
      
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
 * ✅ Get Collaboration Requests (Received)
 */
app.http('getCollaborationRequests', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'collaborations/requests',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view requests
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const result = await getCollaborationRequests(user.userId);

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
 * ✅ Get My Sent Requests
 */
app.http('getMySentRequests', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'collaborations/sent-requests',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view sent requests
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const result = await getMySentRequests(user.userId);

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
 * ✅ Get Active Collaborations
 */
app.http('getActiveCollaborations', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'collaborations/active',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view collaborations
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const result = await getActiveCollaborations(user.userId);

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
 * ✅ Accept Collaboration
 */
app.http('acceptCollaboration', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'collaborations/accept/{collabId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can accept collaborations
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { collabId } = request.params;
      const result = await acceptCollaboration(collabId, user.userId);

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
 * ✅ Reject Collaboration
 */
app.http('rejectCollaboration', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'collaborations/reject/{collabId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can reject collaborations
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { collabId } = request.params;
      const result = await rejectCollaboration(collabId, user.userId);

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
 * ✅ Cancel Collaboration Request
 */
app.http('cancelCollaborationRequest', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'collaborations/cancel/{collabId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can cancel requests
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { collabId } = request.params;
      const result = await cancelCollaborationRequest(collabId, user.userId);

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
 * ✅ End Collaboration
 */
app.http('endCollaboration', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'collaborations/end/{collabId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can end collaborations
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { collabId } = request.params;
      const result = await endCollaboration(collabId, user.userId);

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
 * ✅ Get Collaboration by ID
 */
app.http('getCollaborationById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'collaborations/{collabId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view collaborations
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { collabId } = request.params;
      const result = await getCollaborationById(collabId, user.userId);

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
 * ✅ Search Owners
 */
app.http('searchOwners', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'collaborations/search-owners',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can search other owners
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { search } = request.query;
      if (!search) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Search term is required' },
        };
      }

      const result = await searchOwners(user.userId, search);

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