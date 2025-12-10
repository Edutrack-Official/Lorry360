const { app } = require('@azure/functions');
const Busboy = require('busboy');
const connectDB = require('../utils/db');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  forgotPassword,
  resetPassword,
  deactivateUser,
  deleteUserLogo,
  getAllOwners,
  updateUserLogo
} = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { loginUser } = require('../controllers/auth.controller');

/**
 * ✅ Login User
 */
app.http('loginUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (req, context) => {
    try {
      await connectDB();
      const body = await req.json();
      const result = await loginUser(body);

      return {
        status: 200,
        jsonBody: result
      };
    } catch (err) {
      return {
        status: 401,
        jsonBody: { error: err.message }
      };
    }
  }
});

/**
 * ✅ Create User with Logo Upload
 */
app.http('createUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/create',
  handler: async (request) => {
    try {
      await connectDB();
      
      // ✅ Verify token for admin access
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only admin can create users
      if (user.role !== 'admin') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Admin role required.' },
        };
      }

      const body = await request.json();
      const result = await createUser(body);
      
      // ✅ Include new access token if generated
      const response = { status: 201, jsonBody: result };
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
 * ✅ Get All Users
 */
app.http('getAllUsers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users',
  handler: async (request) => {
    try {
      await connectDB();
      
      // ✅ Verify token
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only admin can view all users
      if (user.role !== 'admin') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Admin role required.' },
        };
      }

      const filterParams = request.query;
      const result = await getAllUsers(filterParams);

      // ✅ Include new access token if generated
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
 * ✅ Get User by ID
 */
app.http('getUserById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/{userId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      // ✅ Verify token
      const { decoded: user, newAccessToken } = await verifyToken(request);

      const { userId } = request.params;

      // Users can only access their own data, admin can access any
      if (user.role !== 'admin' && user.userId !== userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied.' },
        };
      }

      const result = await getUserById(userId);

      // ✅ Include new access token if generated
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
 * ✅ Update User with Logo Upload
 */
app.http('updateUser', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/update/{userId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      // ✅ Verify token
      const { decoded: user, newAccessToken } = await verifyToken(request);

      const { userId } = request.params;
      const body = await request.json();

      // Users can only update their own data, admin can update any
      if (user.role !== 'admin' && user.userId !== userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied.' },
        };
      }

      // Note: Logo must be handled separately via dedicated upload endpoint
      const result = await updateUser(userId, body);

      // ✅ Include new access token if generated
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
 * ✅ Delete User Logo
 */
app.http('deleteUserLogo', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'users/{userId}/logo',
  handler: async (request) => {
    try {
      await connectDB();
      
      // ✅ Verify token
      const { decoded: user, newAccessToken } = await verifyToken(request);

      const { userId } = request.params;

      // Users can only delete their own logo, admin can delete any
      if (user.role !== 'admin' && user.userId !== userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied.' },
        };
      }

      const result = await deleteUserLogo(userId);

      // ✅ Include new access token if generated
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
 * ✅ Forgot Password
 */
app.http('forgotPassword', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/forgot-password',
  handler: async (request) => {
    try {
      await connectDB();

      const body = await request.json();
      const { email, otp } = body;

      if (!email || !otp) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Email and OTP are required' },
        };
      }

      const result = await forgotPassword(email, otp);

      return {
        status: 200,
        jsonBody: { success: true, data: result },
      };
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Reset Password
 */
app.http('resetPassword', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/reset-password',
  handler: async (request) => {
    try {
      await connectDB();

      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Email and new password are required' },
        };
      }

      const result = await resetPassword(email, password);

      return {
        status: 200,
        jsonBody: { success: true, data: result },
      };
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Deactivate User
 */
app.http('deactivateUser', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/deactivate/{userId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      // ✅ Verify token for admin access
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only admin can deactivate users
      if (user.role !== 'admin') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Admin role required.' },
        };
      }

      const { userId } = request.params;
      const result = await deactivateUser(userId);

      // ✅ Include new access token if generated
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
 * ✅ Get All Owners
 */
app.http('getAllOwners', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/owners',
  handler: async (request) => {
    try {
      await connectDB();
      
      // ✅ Verify token
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only authenticated users can view owners
      if (!user) {
        return {
          status: 401,
          jsonBody: { success: false, error: 'Authentication required' },
        };
      }

      const filterParams = request.query;
      const result = await getAllOwners(filterParams);

      // ✅ Include new access token if generated
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
 * ✅ Update User Logo Only
 */
app.http('updateUserLogo', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/{userId}/logo',
  handler: async (req, context) => {
    try {
      await connectDB();
      
      // ✅ Verify token
      const { decoded: user, newAccessToken } = await verifyToken(req);
      
      const { userId } = req.params;

      // Users can only update their own logo, admin can update any
      if (user.role !== 'admin' && user.userId !== userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied.' },
        };
      }

      const headers = Object.fromEntries(req.headers);
      const busboy = Busboy({ headers });

      let logoFile = null;

      const fileParsePromise = new Promise((resolve, reject) => {
        busboy.on('file', (fieldname, file, { filename, encoding, mimeType }) => {
          const chunks = [];

          file.on('data', (chunk) => chunks.push(chunk));
          
          file.on('end', () => {
            if (fieldname === 'logo') {
              logoFile = {
                fieldname,
                originalname: filename,
                mimetype: mimeType,
                buffer: Buffer.concat(chunks),
                size: chunks.reduce((acc, chunk) => acc + chunk.length, 0)
              };
            }
          });
        });

        busboy.on('finish', resolve);
        busboy.on('error', reject);
      });

      // Feed Busboy with raw buffer
      const buffer = Buffer.from(await req.arrayBuffer());
      busboy.end(buffer);
      await fileParsePromise;

      if (!logoFile) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Logo file is required' },
        };
      }

      // Call controller with logo file only
      const result = await updateUserLogo(userId, logoFile);

      // ✅ Include new access token if generated
      const response = { status: 200, jsonBody: { success: true, data: result } };
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      context.log('Update logo error:', err.message);
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});