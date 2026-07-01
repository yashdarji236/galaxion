const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header, access denied' });
  }

  // Token format: Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Authorization header format is Bearer <token>' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'galaxion_secret_key_2026_isro_bah_ps08');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};
