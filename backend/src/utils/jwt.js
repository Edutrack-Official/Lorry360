// utils/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const signAccessToken = (userId, role) => {
  try {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '30m' }); // 15 minutes
  } catch (error) {
    throw new Error('Failed to sign access token');
  }
};

const signRefreshToken = (userId, role) => {
  try {
    return jwt.sign({ userId, role }, REFRESH_SECRET, { expiresIn: '2d' });
  } catch (error) {
    throw new Error('Failed to sign refresh token');
  }
};


const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};