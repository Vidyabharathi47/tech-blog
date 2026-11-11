
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {

  // 1. Check Authorization Header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. No token provided.'
    });
  }

  // 2. Extract JWT Token
  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: 'Access denied. Invalid token.'
    });
  }

  // 3. Check JWT Secret
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing.');

    return res.status(500).json({
      message: 'Server authentication configuration error.'
    });
  }

  let decoded;

  // 4. Verify JWT Token
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.'
    });
  }

  // 5. Validate Token Payload
  if (
    !decoded ||
    typeof decoded !== 'object' ||
    !decoded.id
  ) {
    return res.status(401).json({
      message: 'Invalid authentication token.'
    });
  }

  // 6. Verify User Against MongoDB
  try {
    const user = await User.findById(decoded.id)
      .select('_id name email role');

    if (!user) {
      return res.status(401).json({
        message: 'User account not found.'
      });
    }

    // 7. Check Current Admin Role
    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admins only.'
      });
    }

    // 8. Store Authenticated User
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // 9. Allow Request
    next();

  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(500).json({
      message: 'Unable to verify user authentication.'
    });
  }
};

module.exports = authMiddleware;
