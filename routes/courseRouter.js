const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseForm,
  getEditCourseForm,
  enrollInCourse,
  getTeacherDashboard,
  getStudentDashboard
} = require('../controllers/courseController');
const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/new', protect, authorize('teacher', 'admin'), getCourseForm);

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'teacher',
      select: 'name email'
    }),
    getCourses
  )
  .post(protect, authorize('teacher', 'admin'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('teacher', 'admin'), updateCourse)
  .delete(protect, authorize('teacher', 'admin'), deleteCourse);

router.get('/:id/edit', protect, authorize('teacher', 'admin'), getEditCourseForm);

router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);

// Routes for dashboards
router.get('/teacher/dashboard', protect, authorize('teacher'), getTeacherDashboard);
router.get('/student/dashboard', protect, authorize('student'), getStudentDashboard);

module.exports = router;
