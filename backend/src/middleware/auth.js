// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { config } = require('../config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.trim().split(/\s+/);
  const scheme = parts[0] || '';
  const token = parts[1];

  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || config.jwtSecret;
    const decoded = jwt.verify(token.trim(), secret);
    req.user = decoded; // { userId, email, storeId, tenantId }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;