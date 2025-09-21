const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'mentor', 'student'],
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: function() {
      return this.role !== 'admin';
    }
  },
  uniqueCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Optional mentor link for students
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  // Optional analytics/contact fields for mentor views
  attendancePct: { type: Number, required: false, default: null }, // 0-100
  riskLevel: { type: String, enum: ['low', 'medium', 'high', null], default: null },
  parentsContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  scores: [{ subject: String, value: Number }],
  wellbeingResponses: [{
    date: { type: Date, default: Date.now },
    mood: { type: Number }, // 1-5
    stress: { type: Number },
    sleep: { type: Number },
    notes: { type: String }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate unique 6-digit code
userSchema.methods.generateUniqueCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.uniqueCode = code;
  return code;
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
