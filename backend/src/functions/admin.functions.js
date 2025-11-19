const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { initializeAdmin } = require('../controllers/admin.controller');

/**
 * ✅ Initialize Admin User (Run this once after deployment)
 */
app.http('initializeAdmin', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'system/initialize-admin',  // ✅ Changed route to avoid conflict
  handler: async (request) => {
    try {
      await connectDB();
      
      const result = await initializeAdmin();
      
      return {
        status: 200,
        jsonBody: result
      };
    } catch (err) {
      return {
        status: 500,
        jsonBody: { 
          success: false, 
          error: err.message 
        },
      };
    }
  },
});