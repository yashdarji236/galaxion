const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Authentication bypassed: allow all requests
  req.user = { id: 'mock-user-id', email: 'admin@galaxion.dev' };
  next();
};
