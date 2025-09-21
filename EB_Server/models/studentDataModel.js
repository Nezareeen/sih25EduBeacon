
const mongoose = require('mongoose');

const studentDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Links this to a specific user
  },
  attendance: {
    type: Number,
    default: 100, // Percentage
  },
  grades: {
    type: Number,
    default: 100, // Average score
  },
  surveyResponses: [{
    question: String,
    answer: String,
  }],
  dropoutRisk: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  lastRiskAnalysis: {
    type: Date,
  },
}, {
  timestamps: true,
});

const StudentData = mongoose.model('StudentData', studentDataSchema);

module.exports = StudentData;
