const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
    }

    // Extract token after 'Bearer '
    const token = authHeader.split(' ')[1];
    
    if (!token || token.trim() === '') {
      return res.status(401).json({ success: false, message: 'Token is empty' });
    }

    if (!process.env.SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log('Authentication Error:', err);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = authenticate;