const jwt = require('jsonwebtoken');
const { verifyRefreshToken, signAccessToken } = require('../utils/jwt');

const verifyToken = async (req) => {
  const frontendVersion = req.headers.get('x-app-version');
  const backendVersion = process.env.FRONTEND_VERSION;

  console.log('Frontend Version:', frontendVersion);
  console.log('Backend Version:', backendVersion);

  if (frontendVersion && backendVersion && frontendVersion !== backendVersion) {
    const err = new Error('Version mismatch. Please refresh your app.');
    err.status = 400;
    err.details = { FRONTEND_VERSION: backendVersion };
    throw err;
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Authorization token missing or malformed');
    err.status = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1];
  const refreshToken = req.headers.get('x-refresh-token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { decoded, newAccessToken: null };
  } catch (err) {
    // ❗ Fix: throw proper Error objects here
    if (!refreshToken) {
      const e = new Error('Token expired. Please login again.');
      e.status = 401;
      throw e;
    }

    try {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      const newAccessToken = signAccessToken(decodedRefresh.userId, decodedRefresh.role);
      return { decoded: decodedRefresh, newAccessToken };
    } catch (refreshError) {
      const e = new Error('Session expired. Please login again.');
      e.status = 401;
      throw e;
    }
  }
};

module.exports = { verifyToken };
