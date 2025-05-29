const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Инициализация GridFS Bucket
let gfsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
});

// Настройка Multer для обработки файлов в памяти
const storage = new multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // Лимит 500MB
});

/**
 * Загружает файл в GridFS
 * @param {Object} file - Файл из Multer
 * @returns {Promise<mongoose.Types.ObjectId>} ID загруженного файла
 */
const uploadToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    const uploadStream = gfsBucket.openUploadStream(filename, {
      contentType: file.mimetype
    });

    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
    uploadStream.end(file.buffer);
  });
};

// @desc    Создать новый курс с видео
// @route   POST /api/v1/courses
// @access  Private (teacher/admin)
exports.createCourse = [
  upload.array('videos'),
  asyncHandler(async (req, res, next) => {
    try {
      // Проверка прав доступа
      if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
        return next(new ErrorResponse('Not authorized to create courses', 403));
      }

      // Парсинг модулей
      let parsedModules;
      try {
        parsedModules = typeof req.body.modules === 'string' 
          ? JSON.parse(req.body.modules) 
          : req.body.modules;
      } catch (err) {
        return next(new ErrorResponse('Invalid modules format', 400));
      }

      // Загрузка видео в GridFS
      const fileIds = {};
      if (req.files?.length > 0) {
        for (const file of req.files) {
          try {
            fileIds[file.originalname] = await uploadToGridFS(file);
          } catch (err) {
            console.error('File upload error:', err);
            return next(new ErrorResponse('File upload failed', 500));
          }
        }
      }

      // Создание курса
      const course = await Course.create({
        ...req.body,
        teacher: req.user.id,
        modules: parsedModules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            video: fileIds[lesson.video] || null
          }))
        }))
      });

      res.status(201).json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  })
];

// @desc    Получить все курсы
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = (req, res, next) => {
  res.status(200).json(res.advancedResults);
};

// @desc    Получить курс по ID
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'teacher',
    select: 'name email'
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: course });
});


// @desc    Обновить курс
// @route   PUT /api/v1/courses/:id
// @access  Private (teacher/admin)
exports.updateCourse = [
  upload.array('videos'),
  asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Проверка прав
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this course', 403));
    }

    // Загрузка новых видео
    const fileIds = {};
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          fileIds[file.originalname] = await uploadToGridFS(file);
        } catch (err) {
          console.error('File upload error:', err);
          return next(new ErrorResponse('File upload failed', 500));
        }
      }
    }

    // Получаем список видео для удаления
    const deleteVideos = Array.isArray(req.body.deleteVideos)
      ? req.body.deleteVideos
      : req.body.deleteVideos ? [req.body.deleteVideos] : [];

    // Обновление данных курса
    const { modules, ...rest } = req.body;
    let parsedModules;
    
    try {
      parsedModules = typeof modules === 'string' ? JSON.parse(modules) : modules;
    } catch (err) {
      return next(new ErrorResponse('Invalid modules format', 400));
    }

    Object.assign(course, rest);
    
    if (parsedModules) {
      course.modules = parsedModules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => {
          // Определяем новое значение для видео
          let newVideo = lesson.video;
          
          // Если видео помечено на удаление
          if (deleteVideos.includes(lesson.video)) {
            newVideo = null;
          } 
          // Если есть новое видео для этого урока
          else if (fileIds[lesson.video]) {
            newVideo = fileIds[lesson.video];
          }
          
          return {
            ...lesson,
            video: newVideo
          };
        })
      }));
    }

    await course.save();
    
    // Удаляем помеченные на удаление видео из GridFS
    if (deleteVideos.length > 0) {
      for (const videoId of deleteVideos) {
        try {
          // Проверяем, существует ли файл перед удалением
          const files = await gfsBucket.find({ _id: new mongoose.Types.ObjectId(videoId) }).toArray();
          if (files.length === 0) {
            console.warn(`Video file with id ${videoId} not found in GridFS, skipping deletion.`);
            continue;
          }
          await deleteFromGridFS(videoId);
        } catch (err) {
          console.error(`Failed to delete video ${videoId}`, err);
        }
      }
    }

    res.status(200).json({ success: true, data: course });
  })
];

// @desc    Удалить курс
// @route   DELETE /api/v1/courses/:id
// @access  Private (teacher/admin)
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Проверка прав
  if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this course', 403));
  }

  // TODO: Удаление связанных видео из GridFS
  await course.deleteOne();
  res.redirect('/teacher/dashboard');
});

// @desc    Получить форму создания курса
// @route   GET /courses/new
// @access  Private (teacher/admin)
exports.getCourseForm = (req, res, next) => {
  res.render('courseForm', { title: 'Create Course' });
};

/**
 * Удаляет файл из GridFS
 * @param {String} fileId - ID файла для удаления
 * @returns {Promise}
 */
const deleteFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!gfsBucket) {
      return reject(new Error('GridFS not initialized'));
    }

    const id = new mongoose.Types.ObjectId(fileId);
    gfsBucket.delete(id, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// @desc    Получить форму редактирования курса
// @route   GET /courses/:id/edit
// @access  Private (teacher/admin)
exports.getEditCourseForm = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'modules.lessons.video',
      model: 'uploads.files',
      select: 'filename _id'
    });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Преобразуем для шаблона
  const courseData = course.toObject({ virtuals: true });
  
  // Добавляем информацию о видео для каждого урока
  courseData.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson.video && typeof lesson.video === 'object') {
        lesson.videoFile = {
          filename: lesson.video.filename,
          id: lesson.video._id
        };
      }
    });
  });

  res.render('editCourse', { 
    title: 'Edit Course', 
    course: courseData
  });
});

// @desc    Получить дашборд преподавателя
// @route   GET /teacher/dashboard
// @access  Private (teacher)
exports.getTeacherDashboard = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  const courses = await Course.find({ teacher: req.user.id });
  res.render('teacherDashboard', { 
    title: 'Teacher Dashboard', 
    courses 
  });
});

// @desc    Получить дашборд студента
// @route   GET /student/dashboard
// @access  Private (student)
exports.getStudentDashboard = asyncHandler(async (req, res, next) => {
  const [allCourses, enrolledCourses] = await Promise.all([
    Course.find(),
    Course.find({ students: req.user.id }) // Предполагаем наличие поля students
  ]);

  res.render('studentDashboard', { 
    title: 'Student Dashboard', 
    allCourses, 
    enrolledCourses 
  });
});

// @desc    Записаться на курс
// @route   POST /api/v1/courses/:id/enroll
// @access  Private (student)
exports.enrollInCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Проверка, не записан ли уже студент
  if (course.students.includes(req.user.id)) {
    return next(new ErrorResponse('Already enrolled in this course', 400));
  }

  // Добавление студента
  course.students.push(req.user.id);
  await course.save();

  res.status(200).json({ 
    success: true, 
    message: 'Enrolled in course successfully' 
  });
});

// @desc    Получить видео поток
// @route   GET /api/v1/courses/video/:id
// @access  Public
exports.getVideoStream = asyncHandler(async (req, res, next) => {
  try {
    if (!gfsBucket) {
      return next(new ErrorResponse('GridFS not initialized', 500));
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await gfsBucket.find({ _id: fileId }).toArray();

    if (!files.length) {
      return next(new ErrorResponse('File not found', 404));
    }

    const file = files[0];
    if (!file.contentType?.startsWith('video/')) {
      return next(new ErrorResponse('Not a video file', 400));
    }

    res.set('Content-Type', file.contentType);
    const downloadStream = gfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    next(new ErrorResponse('Error retrieving video', 500));
  }
});