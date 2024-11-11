const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  average_score: {
    type: Number,
    required: true
  },
  interview_duration: {
    type: Number,
    required: true
  },
  total_questions: {
    type: Number,
    required: true
  },
  qa_pairs: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  }],
  detailed_evaluation: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const History = mongoose.model('History', evaluationSchema);
module.exports = History;
