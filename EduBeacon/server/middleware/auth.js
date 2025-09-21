const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.warn('[Auth] No token provided', { method: req.method, path: req.originalUrl });
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.warn('[Auth] Token valid but user not found', { userId: decoded.id });
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    console.log('[Auth] OK', { userId: user._id?.toString?.(), role: user.role, path: req.originalUrl });
    next();
  } catch (error) {
    console.warn('[Auth] Token verification failed', { error: error?.message, path: req.originalUrl });
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.warn('[AdminAuth] Denied', { role: req.user.role, userId: req.user._id?.toString?.(), path: req.originalUrl });
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  console.log('[AdminAuth] OK', { role: req.user.role, userId: req.user._id?.toString?.(), path: req.originalUrl });
  next();
};

const mentorAuth = (req, res, next) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    console.warn('[MentorAuth] Denied', { role: req.user.role, userId: req.user._id?.toString?.(), path: req.originalUrl });
    return res.status(403).json({ message: 'Access denied. Mentor or Admin role required.' });
  }
  console.log('[MentorAuth] OK', { role: req.user.role, userId: req.user._id?.toString?.(), path: req.originalUrl });
  next();
};

const studentAuth = (req, res, next) => {
  if (req.user.role !== 'student' && req.user.role !== 'admin') {
    console.warn('[StudentAuth] Denied', { role: req.user.role, userId: req.user._id?.toString?.(), path: req.originalUrl });
    return res.status(403).json({ message: 'Access denied. Student or Admin role required.' });
  }
  console.log('[StudentAuth] OK', { role: req.user.role, userId: req.user._id?.toString?.(), path: req.originalUrl });
  next();
};

module.exports = { auth, adminAuth, mentorAuth, studentAuth };
