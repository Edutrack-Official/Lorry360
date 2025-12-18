// const { app } = require("@azure/functions");
// const connectDB = require("../utils/db");
// const { verifyToken } = require("../middleware/auth.middleware");
// const { saveSubscription } = require("../controllers/push.controller");

// // Common auth wrapper (same pattern you already use)
// const withAuth = async (request) => {
//   await connectDB();
//   const { decoded: user, newAccessToken } = await verifyToken(request);
//   return { user, newAccessToken };
// };

// /**
//  * ✅ Save Push Subscription
//  */
// app.http("savePushSubscription", {
//   methods: ["POST"],
//   route: "push/subscribe",
//   authLevel: "anonymous",
//   handler: async (req) => {
//     try {
//       const { user, newAccessToken } = await withAuth(req);
//       const body = await req.json();

//       await saveSubscription(user.userId, body.subscription);

//       const response = {
//         status: 200,
//         jsonBody: { success: true }
//       };

//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }

//       return response;

//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: {
//           success: false,
//           error: err.message
//         }
//       };
//     }
//   }
// });

const { app } = require("@azure/functions");
const connectDB = require("../utils/db");
const { verifyToken } = require("../middleware/auth.middleware");
const {
  saveSubscription,
  detachSubscription
} = require("../controllers/push.controller");

/**
 * ✅ Save / Rebind Push Subscription
 * POST /api/push/subscribe
 */
app.http("savePushSubscription", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "push/subscribe",
  handler: async (request) => {
    try {
      await connectDB();

      // ✅ Verify token
      const { decoded: user, newAccessToken } = await verifyToken(request);

      const body = await request.json();
      const { deviceId, subscription } = body;

      if (!deviceId || !subscription) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            error: "deviceId and subscription are required"
          }
        };
      }

      const result = await saveSubscription(
        user.userId,
        deviceId,
        subscription
      );

      // ✅ Include refreshed token if any
      const response = {
        status: 200,
        jsonBody: result
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
        }
      };
    }
  }
});

/**
 * ✅ Detach Push Subscription (Logout)
 * POST /api/push/detach
 */
app.http("detachPushSubscription", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "push/detach",
  handler: async (request) => {
    try {
      await connectDB();

      // 🔐 Optional: verify token (recommended)
      const { newAccessToken } = await verifyToken(request);

      const body = await request.json();
      const { deviceId } = body;

      if (!deviceId) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            error: "deviceId is required"
          }
        };
      }

      await detachSubscription(deviceId);

      const response = {
        status: 200,
        jsonBody: { success: true }
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
        }
      };
    }
  }
});
