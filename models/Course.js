const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title']
  },
  text: {
    type: String,
    required: [true, 'Please add lesson text']
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'uploads.files',
    required: false
  }
}, { toObject: { virtuals: true }, toJSON: { virtuals: true } });

LessonSchema.virtual('videoFile', {
  ref: 'uploads.files',
  localField: 'video',
  foreignField: '_id',
  justOne: true
});

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a module title']
  },
  lessons: [LessonSchema]
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipsAvailable: {
    type: Boolean,
    default: false
  },
  modules: [ModuleSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals
CourseSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Cascade delete assignments when a course is deleted
CourseSchema.pre('remove', async function(next) {
  await this.model('Assignment').deleteMany({ course: this._id });
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
