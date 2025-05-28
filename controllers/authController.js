const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// Register user
exports.register = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.create({ email, password, role });
  req.session.user = { id: user._id, email: user.email, role: user.role };
  res.status(201).json({ success: true, user: req.session.user });
});

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  req.session.user = { id: user._id, email: user.email, role: user.role };
  res.status(200).json({ success: true, user: req.session.user });
});

// Logout user
exports.logout = asyncHandler(async (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(200).json({ success: true });
  });
});

// Get current logged in user
exports.getMe = asyncHandler(async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Not authorized' });
  const user = await User.findById(req.session.user.id);
  res.status(200).json({ success: true, user });
});
