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
  // Student Roll Number for identification
  rollNumber: { type: String, required: false, unique: true, sparse: true },
  
  // Comprehensive Student Analytics Data
  attendanceData: {
    percentage: { type: Number, default: 0, min: 0, max: 100 }, // Overall attendance percentage
    totalClasses: { type: Number, default: 0 },
    attendedClasses: { type: Number, default: 0 },
    history: [{
      date: { type: Date, required: true },
      status: { type: String, enum: ['present', 'absent', 'late'], required: true },
      subject: { type: String, required: false }
    }],
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Test Results and Academic Performance
  academicData: {
    overallGrade: { type: String, default: 'N/A' }, // A+, A, B+, etc.
    gpa: { type: Number, default: 0, min: 0, max: 4 },
    testResults: [{
      subject: { type: String, required: true },
      testName: { type: String, required: true },
      maxMarks: { type: Number, required: true },
      obtainedMarks: { type: Number, required: true },
      percentage: { type: Number, required: true },
      date: { type: Date, required: true },
      grade: { type: String, required: false }
    }],
    subjectWisePerformance: [{
      subject: { type: String, required: true },
      averagePercentage: { type: Number, default: 0 },
      totalTests: { type: Number, default: 0 },
      lastTestDate: { type: Date }
    }],
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Fee Payment Status and History
  feeData: {
    totalFeeAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['paid', 'partial', 'pending', 'overdue'], default: 'pending' },
    dueDate: { type: Date },
    paymentHistory: [{
      amount: { type: Number, required: true },
      paymentDate: { type: Date, required: true },
      paymentMethod: { type: String, enum: ['cash', 'card', 'online', 'cheque'], required: true },
      receiptNumber: { type: String, required: true },
      description: { type: String }
    }],
    lastPaymentDate: { type: Date },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Multi-Factor Risk Analysis
  riskAnalysis: {
    overallRiskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    attendanceRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    academicRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    financialRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    riskFactors: [{ type: String }], // Array of identified risk factors
    lastAnalysisDate: { type: Date, default: Date.now },
    alertsGenerated: [{
      type: { type: String, enum: ['attendance', 'academic', 'financial', 'multi-factor'], required: true },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
      acknowledged: { type: Boolean, default: false },
      acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      acknowledgedDate: { type: Date }
    }]
  },
  
  // Parent/Guardian Contact Information
  parentsContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    relationship: { type: String, default: 'Parent' },
    alternateContact: { type: String, default: '' }
  },
  
  // Legacy fields for backward compatibility
  attendancePct: { type: Number, required: false, default: null }, // 0-100
  riskLevel: { type: String, enum: ['low', 'medium', 'high', null], default: null },
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

// Calculate multi-factor risk analysis
userSchema.methods.calculateRiskAnalysis = function() {
  if (this.role !== 'student') return;
  
  const riskFactors = [];
  let attendanceRisk = 'low';
  let academicRisk = 'low';
  let financialRisk = 'low';
  
  // Attendance Risk Analysis
  const attendancePercentage = this.attendanceData?.percentage || 0;
  if (attendancePercentage < 60) {
    attendanceRisk = 'high';
    riskFactors.push('Critical attendance below 60%');
  } else if (attendancePercentage < 75) {
    attendanceRisk = 'medium';
    riskFactors.push('Low attendance below 75%');
  }
  
  // Academic Risk Analysis
  const gpa = this.academicData?.gpa || 0;
  const recentTests = this.academicData?.testResults?.slice(-3) || [];
  const recentAverage = recentTests.length > 0 
    ? recentTests.reduce((sum, test) => sum + test.percentage, 0) / recentTests.length 
    : 0;
  
  if (gpa < 2.0 || recentAverage < 50) {
    academicRisk = 'high';
    riskFactors.push('Poor academic performance (GPA < 2.0 or recent tests < 50%)');
  } else if (gpa < 2.5 || recentAverage < 65) {
    academicRisk = 'medium';
    riskFactors.push('Declining academic performance');
  }
  
  // Financial Risk Analysis
  const feeStatus = this.feeData?.paymentStatus || 'pending';
  const pendingAmount = this.feeData?.pendingAmount || 0;
  const dueDate = this.feeData?.dueDate;
  
  if (feeStatus === 'overdue' || (dueDate && new Date() > dueDate && pendingAmount > 0)) {
    financialRisk = 'high';
    riskFactors.push('Overdue fee payments');
  } else if (feeStatus === 'partial' || pendingAmount > 0) {
    financialRisk = 'medium';
    riskFactors.push('Pending fee payments');
  }
  
  // Overall Risk Calculation
  let overallRiskLevel = 'low';
  const highRiskCount = [attendanceRisk, academicRisk, financialRisk].filter(risk => risk === 'high').length;
  const mediumRiskCount = [attendanceRisk, academicRisk, financialRisk].filter(risk => risk === 'medium').length;
  
  if (highRiskCount >= 2) {
    overallRiskLevel = 'critical';
    riskFactors.push('Multiple high-risk factors detected');
  } else if (highRiskCount >= 1) {
    overallRiskLevel = 'high';
  } else if (mediumRiskCount >= 2) {
    overallRiskLevel = 'high';
  } else if (mediumRiskCount >= 1) {
    overallRiskLevel = 'medium';
  }
  
  // Update risk analysis
  this.riskAnalysis = {
    overallRiskLevel,
    attendanceRisk,
    academicRisk,
    financialRisk,
    riskFactors,
    lastAnalysisDate: new Date(),
    alertsGenerated: this.riskAnalysis?.alertsGenerated || []
  };
  
  return this.riskAnalysis;
};

// Generate alert if risk threshold is met
userSchema.methods.generateRiskAlert = function() {
  const riskAnalysis = this.calculateRiskAnalysis();
  if (!riskAnalysis) return null;
  
  const { overallRiskLevel, riskFactors } = riskAnalysis;
  
  // Generate alert for high or critical risk
  if (overallRiskLevel === 'high' || overallRiskLevel === 'critical') {
    const alert = {
      type: 'multi-factor',
      severity: overallRiskLevel,
      message: `Student ${this.name} (${this.rollNumber || this.email}) requires immediate attention: ${riskFactors.join(', ')}`,
      date: new Date(),
      acknowledged: false
    };
    
    // Add to alerts if not already present
    const existingAlert = this.riskAnalysis.alertsGenerated.find(
      a => a.type === alert.type && a.severity === alert.severity && !a.acknowledged
    );
    
    if (!existingAlert) {
      this.riskAnalysis.alertsGenerated.push(alert);
      return alert;
    }
  }
  
  return null;
};

// Update attendance data
userSchema.methods.updateAttendance = function(date, status, subject = null) {
  if (!this.attendanceData) {
    this.attendanceData = { percentage: 0, totalClasses: 0, attendedClasses: 0, history: [] };
  }
  
  // Add to history
  this.attendanceData.history.push({ date, status, subject });
  
  // Recalculate totals
  this.attendanceData.totalClasses = this.attendanceData.history.length;
  this.attendanceData.attendedClasses = this.attendanceData.history.filter(
    h => h.status === 'present' || h.status === 'late'
  ).length;
  
  // Calculate percentage
  this.attendanceData.percentage = this.attendanceData.totalClasses > 0 
    ? Math.round((this.attendanceData.attendedClasses / this.attendanceData.totalClasses) * 100)
    : 0;
  
  this.attendanceData.lastUpdated = new Date();
  
  // Trigger risk analysis
  this.calculateRiskAnalysis();
};

// Add test result
userSchema.methods.addTestResult = function(testData) {
  if (!this.academicData) {
    this.academicData = { overallGrade: 'N/A', gpa: 0, testResults: [], subjectWisePerformance: [] };
  }
  
  // Add test result
  const testResult = {
    ...testData,
    percentage: Math.round((testData.obtainedMarks / testData.maxMarks) * 100)
  };
  this.academicData.testResults.push(testResult);
  
  // Update subject-wise performance
  let subjectPerf = this.academicData.subjectWisePerformance.find(s => s.subject === testData.subject);
  if (!subjectPerf) {
    subjectPerf = { subject: testData.subject, averagePercentage: 0, totalTests: 0 };
    this.academicData.subjectWisePerformance.push(subjectPerf);
  }
  
  const subjectTests = this.academicData.testResults.filter(t => t.subject === testData.subject);
  subjectPerf.totalTests = subjectTests.length;
  subjectPerf.averagePercentage = Math.round(
    subjectTests.reduce((sum, test) => sum + test.percentage, 0) / subjectTests.length
  );
  subjectPerf.lastTestDate = testData.date;
  
  // Calculate overall GPA (simplified)
  const allTests = this.academicData.testResults;
  const overallPercentage = allTests.reduce((sum, test) => sum + test.percentage, 0) / allTests.length;
  this.academicData.gpa = Math.round((overallPercentage / 25) * 100) / 100; // Convert to 4.0 scale
  
  this.academicData.lastUpdated = new Date();
  
  // Trigger risk analysis
  this.calculateRiskAnalysis();
};

module.exports = mongoose.model('User', userSchema);
