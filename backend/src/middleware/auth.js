// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { config } = require('../config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Use env secret or fallback to config default
    const secret = process.env.JWT_SECRET || config.jwtSecret;
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attaches { userId, email, storeId } to the request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;