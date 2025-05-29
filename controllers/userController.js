const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private (admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private (admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse('User not found with id of ' + req.params.id, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private (admin)
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private (admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new ErrorResponse('User not found with id of ' + req.params.id, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private (admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse('User not found with id of ' + req.params.id, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged-in user's profile
// @route   GET /api/v1/users/profile
// @access  Private (teacher, admin)
exports.getCurrentUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update current logged-in user's profile
// @route   PUT /api/v1/users/profile
// @access  Private (teacher, admin)
exports.updateCurrentUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const { firstName, lastName, discipline, oldPassword, newPassword } = req.body;

  // Update profile fields for teachers only
  if (user.role === 'teacher') {
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (discipline) user.discipline = discipline;
  }

  // Handle password change
  if (oldPassword && newPassword) {
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return next(new ErrorResponse('Old password is incorrect', 400));
    }
    user.password = newPassword;
  }

  await user.save();

  // Update session user data to reflect changes
  if (req.session) {
    req.session.user = user;
  }

  res.status(200).json({
    success: true,
    data: user
  });
});
