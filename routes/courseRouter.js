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
  getStudentDashboard,
  getVideoStream,
  getTestForm,
  createTest
} = require('../controllers/courseController');
const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// View routes
router.get('/new', protect, authorize('teacher', 'admin'), getCourseForm);
router.get('/:id/edit', protect, authorize('teacher', 'admin'), getEditCourseForm);

// API routes
router.route('/')
  .get(
    advancedResults(Course, {
      path: 'teacher',
      select: 'name email'
    }),
    getCourses
  )
  .post(protect, authorize('teacher', 'admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('teacher', 'admin'), updateCourse)
  .delete(protect, authorize('teacher', 'admin'), deleteCourse);

router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);

// Video streaming route
router.get('/video/:id', getVideoStream);

// Dashboard routes
router.get('/teacher/dashboard', protect, authorize('teacher'), getTeacherDashboard);
router.get('/student/dashboard', protect, authorize('student'), getStudentDashboard);

// Test routes
router.get('/:id/tests/new', protect, authorize('teacher', 'admin'), getTestForm);
router.post('/:id/tests', protect, authorize('teacher', 'admin'), createTest);

router.get('/:courseId/tests/:testId', protect, authorize('teacher', 'admin', 'student'), (req, res, next) => {
  const { courseId, testId } = req.params;
  const courseController = require('../controllers/courseController');
  courseController.getTestDetail(req, res, next);
});

router.delete('/:courseId/tests/:testId', protect, authorize('teacher', 'admin'), (req, res, next) => {
  const courseController = require('../controllers/courseController');
  courseController.deleteTest(req, res, next);
});

module.exports = router;
