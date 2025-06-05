const express = require('express');
const {
  getIndex,
  getLogin,
  getRegister,
  getCourses,
  getCourse,
  getProfile,
  
  getEditCourseView
} = require('../controllers/viewController');

const { getCourseForm } = require('../controllers/courseController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getIndex);
router.get('/login', getLogin);
router.get('/register', getRegister);

router.get('/courses', protect, getCourses);
router.get('/courses/:id', protect, getCourse);
router.get('/courses/:id/edit', protect, getEditCourseView);
router.get('/profile', protect, getProfile);

// Redirect /teacher/dashboard to /courses/teacher/dashboard
router.get('/teacher/dashboard', protect, (req, res) => {
  res.redirect('/courses/teacher/dashboard');
});

// Redirect /student/dashboard to /courses/student/dashboard
router.get('/student/dashboard', protect, (req, res) => {
  res.redirect('/courses/student/dashboard');
});

/* Removed duplicate dashboard routes to avoid conflicts */
// router.get('/teacher/dashboard', protect, getTeacherDashboard);
// router.get('/student/dashboard', protect, getStudentDashboard);

router.get('/teacher/createcourse', protect, getCourseForm);

module.exports = router;
