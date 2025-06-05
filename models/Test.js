const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  answers: [AnswerSchema]
});

const TestSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course.modules',
    required: true
  },
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Test', TestSchema);
