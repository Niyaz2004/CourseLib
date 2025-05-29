const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.getIndex = (req, res) => {
  res.render('index', { title: 'Home' });
};

exports.getLogin = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.getRegister = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.getCourses = (req, res) => {
  res.render('courses', { title: 'Courses' });
};

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name email');
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }
  const assignments = await Assignment.find({ course: course._id });
  res.render('course', { title: course.title, course, assignments, user: req.user });
});

exports.getCourseForm = (req, res) => {
  res.render('courseForm', { title: 'Course Form' });
};

exports.getProfile = (req, res) => {
  res.render('profile', { title: 'Profile', user: req.user });
};

exports.getTeacherDashboard = (req, res) => {
  res.render('teacherDashboard', { title: 'Teacher Dashboard' });
};

exports.getStudentDashboard = (req, res) => {
  res.render('studentDashboard', { title: 'Student Dashboard' });
};

exports.getError = (req, res) => {
  res.render('error', { title: 'Error' });
};

exports.getEditCourseView = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found with id of ' + req.params.id, 404));
  }

  res.render('editCourse', { title: 'Edit Course', course });
});
