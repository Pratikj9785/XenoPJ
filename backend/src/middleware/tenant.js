// backend/src/middleware/tenant.js
const tenantMiddleware = (req, res, next) => {
    if (!req.user || !req.user.storeId) {
      return res.status(400).json({ message: 'No tenant ID found in token.' });
    }
    req.storeId = req.user.storeId; // Make storeId available as req.storeId
    next();
  };
  
  module.exports = tenantMiddleware;