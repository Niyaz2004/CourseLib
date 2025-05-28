const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find();
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse('Course not found with id of ' + req.params.id, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create course
// @route   POST /api/v1/courses
// @access  Private (teacher/admin)
exports.createCourse = asyncHandler(async (req, res, next) => {
  console.log('createCourse - req.user:', req.user);
  // Associate course with logged-in teacher
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'User role not authorized to create course' });
  }

  // Extract course data including nested modules and lessons
  const {
    title,
    description,
    weeks,
    tuition,
    minimumSkill,
    scholarshipsAvailable,
    modules
  } = req.body;

  // Validate modules structure if provided
  if (modules && !Array.isArray(modules)) {
    return res.status(400).json({ success: false, message: 'Modules must be an array' });
  }

  // Create course data object
  const courseData = {
    title,
    description,
    weeks,
    tuition,
    minimumSkill,
    scholarshipsAvailable,
    teacher: req.user.id,
    modules: []
  };

  // Validate and assign modules and lessons if provided
  if (modules) {
    for (const mod of modules) {
      if (!mod.title || !Array.isArray(mod.lessons)) {
        return res.status(400).json({ success: false, message: 'Each module must have a title and lessons array' });
      }
      const lessons = [];
      for (const lesson of mod.lessons) {
        if (!lesson.title || !lesson.text || !lesson.video) {
          return res.status(400).json({ success: false, message: 'Each lesson must have title, text, and video' });
        }
        lessons.push({
          title: lesson.title,
          text: lesson.text,
          video: lesson.video
        });
      }
      courseData.modules.push({
        title: mod.title,
        lessons
      });
    }
  }

  const course = await Course.create(courseData);
  console.log('createCourse - course created:', course);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private (teacher/admin)
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse('Course not found with id of ' + req.params.id, 404)
    );
  }

  // Extract course data including nested modules and lessons
  const {
    title,
    description,
    weeks,
    tuition,
    minimumSkill,
    scholarshipsAvailable,
    modules
  } = req.body;

  // Validate modules structure if provided
  if (modules && !Array.isArray(modules)) {
    return res.status(400).json({ success: false, message: 'Modules must be an array' });
  }

  // Update course fields
  course.title = title;
  course.description = description;
  course.weeks = weeks;
  course.tuition = tuition;
  course.minimumSkill = minimumSkill;
  course.scholarshipsAvailable = scholarshipsAvailable;
  course.modules = [];

  // Validate and assign modules and lessons if provided
  if (modules) {
    for (const mod of modules) {
      if (!mod.title || !Array.isArray(mod.lessons)) {
        return res.status(400).json({ success: false, message: 'Each module must have a title and lessons array' });
      }
      const lessons = [];
      for (const lesson of mod.lessons) {
        if (!lesson.title || !lesson.text || !lesson.video) {
          return res.status(400).json({ success: false, message: 'Each lesson must have title, text, and video' });
        }
        lessons.push({
          title: lesson.title,
          text: lesson.text,
          video: lesson.video
        });
      }
      course.modules.push({
        title: mod.title,
        lessons
      });
    }
  }

  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private (teacher/admin)
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse('Course not found with id of ' + req.params.id, 404)
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Show course creation form
// @route   GET /courses/new
// @access  Private (teacher/admin)
exports.getCourseForm = (req, res, next) => {
  res.render('courseForm', { title: 'Create Course' });
};

// @desc    Show course edit form
// @route   GET /courses/:id/edit
// @access  Private (teacher/admin)
exports.getEditCourseForm = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found with id of ' + req.params.id, 404));
  }

  res.render('editCourse', { title: 'Edit Course', course });
});

// @desc    Render teacher dashboard with their courses
// @route   GET /teacher/dashboard
// @access  Private (teacher)
const mongoose = require('mongoose');

exports.getTeacherDashboard = asyncHandler(async (req, res, next) => {
  console.log('getTeacherDashboard - req.session.user:', req.session.user);
  console.log('getTeacherDashboard - req.user:', req.user);
  if (!req.user) {
    console.log('getTeacherDashboard - req.user is undefined');
    return res.redirect('/login');
  }
  let teacherId;
  try {
    teacherId = new mongoose.Types.ObjectId(req.user.id);
    console.log('getTeacherDashboard - teacherId:', teacherId);
  } catch (err) {
    console.error('getTeacherDashboard - Invalid ObjectId:', err);
    return res.status(400).send('Invalid user ID');
  }
  const courses = await Course.find({ teacher: teacherId });
  console.log('getTeacherDashboard - courses found:', courses.length);
  if (courses.length > 0) {
    courses.forEach(course => {
      console.log('Course teacher id:', course.teacher.toString());
      console.log('Course title:', course.title);
      console.log('Course description:', course.description);
      console.log('Course weeks:', course.weeks);
      console.log('Course tuition:', course.tuition);
      console.log('Course minimumSkill:', course.minimumSkill);
      console.log('Course scholarshipsAvailable:', course.scholarshipsAvailable);
      console.log('Course modules:', JSON.stringify(course.modules));
    });
  } else {
    console.log('getTeacherDashboard - No courses found for this teacher');
  }
  console.log('Rendering teacherDashboard view with courses');
  res.render('teacherDashboard', { title: 'Teacher Dashboard', courses });
});

// @desc    Render student dashboard with available and enrolled courses
// @route   GET /student/dashboard
// @access  Private (student)
exports.getStudentDashboard = asyncHandler(async (req, res, next) => {
  const allCourses = await Course.find();
  // For simplicity, assume enrolled courses are all courses (can be improved)
  const enrolledCourses = allCourses; 
  res.render('studentDashboard', { title: 'Student Dashboard', allCourses, enrolledCourses });
});

// @desc    Enroll student in a course
// @route   POST /api/v1/courses/:id/enroll
// @access  Private (student)
exports.enrollInCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }
  // Enrollment logic placeholder: In real app, save enrollment in DB
  res.status(200).json({ success: true, message: 'Enrolled in course successfully' });
});
