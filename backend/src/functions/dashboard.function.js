const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { getDashboardStats, getSalaryDashboard } = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * 📊 Dashboard Statistics Endpoint
 * Returns all dashboard data including salary information
 */
app.http('getDashboardStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dashboard/stats',
  handler: async (request) => {
    try {
      // Connect to database
      await connectDB();
      
      // Verify token and get user info
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Check if user is owner
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { 
            success: false, 
            error: 'Access denied. Owner role required.' 
          },
        };
      }

      console.log(`Fetching dashboard stats for owner: ${user.userId}`);
      
      // Get comprehensive dashboard data including salary
      const dashboardData = await getDashboardStats(user.userId);
      
      // Prepare response
      const response = {
        status: 200,
        jsonBody: {
          success: true,
          data: dashboardData
        }
      };
      
      // Add new access token if generated
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      console.log(`Dashboard stats fetched successfully for owner: ${user.userId}`);
      
      return response;
      
    } catch (error) {
      console.error('Dashboard stats error:', error);
      
      return {
        status: 500,
        jsonBody: { 
          success: false, 
          error: error.message || 'Failed to fetch dashboard data' 
        },
      };
    }
  },
});

/**
 * 💰 Salary Dashboard Endpoint (Optional - if you want separate endpoint)
 * Returns detailed salary information
 */
app.http('getSalaryDashboard', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dashboard/salary',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { 
            success: false, 
            error: 'Access denied. Owner role required.' 
          },
        };
      }

      console.log(`Fetching salary dashboard for owner: ${user.userId}`);
      
      const salaryData = await getSalaryDashboard(user.userId);
      
      const response = {
        status: 200,
        jsonBody: {
          success: true,
          data: salaryData
        }
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
      
    } catch (error) {
      console.error('Salary dashboard error:', error);
      
      return {
        status: 500,
        jsonBody: { 
          success: false, 
          error: error.message || 'Failed to fetch salary dashboard data' 
        },
      };
    }
  },
});