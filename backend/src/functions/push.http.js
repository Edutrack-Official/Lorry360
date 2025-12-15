const { app } = require("@azure/functions");
const connectDB = require("../utils/db");
const { verifyToken } = require("../middleware/auth.middleware");
const { saveSubscription } = require("../controllers/push.controller");

// Common auth wrapper (same pattern you already use)
const withAuth = async (request) => {
  await connectDB();
  const { decoded: user, newAccessToken } = await verifyToken(request);
  return { user, newAccessToken };
};

/**
 * ✅ Save Push Subscription
 */
app.http("savePushSubscription", {
  methods: ["POST"],
  route: "push/subscribe",
  authLevel: "anonymous",
  handler: async (req) => {
    try {
      const { user, newAccessToken } = await withAuth(req);
      const body = await req.json();

      await saveSubscription(user.userId, body.subscription);

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
