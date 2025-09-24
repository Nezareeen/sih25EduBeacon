const express = require('express');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const { auth, mentorAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(mentorAuth);

// @route   GET /api/mentor/timetable
// @desc    Get mentor timetable
// @access  Private (Mentor)
router.get('/timetable', async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      userId: req.user.id,
      organizationId: req.user.organizationId
    });

    res.json(timetable || { events: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentor/timetable
// @desc    Create or update mentor timetable
// @access  Private (Mentor)
router.post('/timetable', async (req, res) => {
  try {
    const { events, weekStart, weekEnd } = req.body;

    const timetable = await Timetable.findOneAndUpdate(
      { userId: req.user.id, organizationId: req.user.organizationId },
      {
        events,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd)
      },
      { upsert: true, new: true }
    );

    res.json(timetable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentor/students
// @desc    Get assigned students (no dummy)
// @access  Private (Mentor)
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({
      organizationId: req.user.organizationId,
      role: 'student',
      mentorId: req.user._id
    }).select('-password');

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentor/analytics
// @desc    Compute analytics from assigned students
// @access  Private (Mentor)
router.get('/analytics', async (req, res) => {
  try {
    const students = await User.find({
      organizationId: req.user.organizationId,
      role: 'student',
      mentorId: req.user._id
    }).select('_id attendancePct riskLevel');

    const totalStudents = students.length;
    const attendanceValues = students
      .map(s => typeof s.attendancePct === 'number' ? s.attendancePct : null)
      .filter(v => v !== null);
    const attendanceRate = attendanceValues.length
      ? Number((attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length).toFixed(1))
      : 0;

    const riskCounts = { low: 0, medium: 0, high: 0 };
    students.forEach(s => {
      if (s.riskLevel === 'low') riskCounts.low++;
      else if (s.riskLevel === 'medium') riskCounts.medium++;
      else if (s.riskLevel === 'high') riskCounts.high++;
    });

    // Minimal weekly trends derived from attendance (synthetic but based on avg)
    const base = attendanceRate || 75;
    const weeklyTrends = [
      { week: 'Week 1', attendance: Math.max(0, Math.min(100, base - 3)), engagement: Math.max(0, Math.min(100, base - 5)) },
      { week: 'Week 2', attendance: Math.max(0, Math.min(100, base - 1)), engagement: Math.max(0, Math.min(100, base - 3)) },
      { week: 'Week 3', attendance: Math.max(0, Math.min(100, base + 2)), engagement: Math.max(0, Math.min(100, base + 1)) },
      { week: 'Week 4', attendance: Math.max(0, Math.min(100, base + 1)), engagement: Math.max(0, Math.min(100, base)) }
    ];

    res.json({
      totalStudents,
      activeStudents: totalStudents, // refine if you track active
      atRiskStudents: riskCounts.high,
      attendanceRate,
      riskCounts,
      weeklyTrends,
      recentActivity: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentor/schedule/today
// @desc    Mentor's events scheduled for today
// @access  Private (Mentor)
router.get('/schedule/today', async (req, res) => {
  try {
    const tt = await Timetable.findOne({ userId: req.user._id, organizationId: req.user.organizationId });
    if (!tt || !tt.events) return res.json([]);

    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const todays = tt.events.filter(ev => {
      const s = new Date(ev.start);
      return s >= start && s < end;
    });

    res.json(todays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentor/student/:id
// @desc    Detailed info for a specific assigned student
// @access  Private (Mentor)
router.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ _id: id, mentorId: req.user._id, organizationId: req.user.organizationId })
      .select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Optionally include student's upcoming schedule for today
    const tt = await Timetable.findOne({ userId: id, organizationId: req.user.organizationId });

    res.json({
      student,
      timetable: tt || { events: [] }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentor/students-overview
// @desc    Get comprehensive overview of all assigned students with consolidated data
// @access  Private (Mentor)
router.get('/students-overview', async (req, res) => {
  try {
    const students = await User.find({
      organizationId: req.user.organizationId,
      role: 'student',
      mentorId: req.user._id
    }).select('-password');

    // Calculate risk analysis for each student
    const studentsWithAnalysis = students.map(student => {
      student.calculateRiskAnalysis();
      return student;
    });

    res.json(studentsWithAnalysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentor/student-profile/:id
// @desc    Get detailed student profile with all consolidated data
// @access  Private (Mentor)
router.get('/student-profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ 
      _id: id, 
      mentorId: req.user._id, 
      organizationId: req.user.organizationId 
    }).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update risk analysis
    student.calculateRiskAnalysis();
    await student.save();

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentor/high-risk-alerts
// @desc    Get all high-risk alerts for assigned students
// @access  Private (Mentor)
router.get('/high-risk-alerts', async (req, res) => {
  try {
    const students = await User.find({
      organizationId: req.user.organizationId,
      role: 'student',
      mentorId: req.user._id
    }).select('-password');

    const alerts = [];
    
    students.forEach(student => {
      student.calculateRiskAnalysis();
      
      if (student.riskAnalysis?.alertsGenerated?.length > 0) {
        student.riskAnalysis.alertsGenerated.forEach(alert => {
          if (!alert.acknowledged && (alert.severity === 'high' || alert.severity === 'critical')) {
            alerts.push({
              ...alert.toObject(),
              student: {
                _id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                email: student.email
              }
            });
          }
        });
      }
    });

    // Sort by severity and date
    alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.date) - new Date(a.date);
    });

    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentor/acknowledge-alert/:studentId/:alertId
// @desc    Acknowledge a specific alert for a student
// @access  Private (Mentor)
router.post('/acknowledge-alert/:studentId/:alertId', async (req, res) => {
  try {
    const { studentId, alertId } = req.params;
    
    const student = await User.findOne({
      _id: studentId,
      mentorId: req.user._id,
      organizationId: req.user.organizationId
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find and acknowledge the alert
    const alert = student.riskAnalysis?.alertsGenerated?.id(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = req.user._id;
      alert.acknowledgedDate = new Date();
      
      await student.save();
      res.json({ message: 'Alert acknowledged successfully' });
    } else {
      res.status(404).json({ message: 'Alert not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentor/update-attendance/:studentId
// @desc    Update attendance record for a student
// @access  Private (Mentor)
router.post('/update-attendance/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { date, status, subject } = req.body;

    const student = await User.findOne({
      _id: studentId,
      mentorId: req.user._id,
      organizationId: req.user.organizationId
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.updateAttendance(new Date(date), status, subject);
    await student.save();

    res.json({ 
      message: 'Attendance updated successfully',
      attendanceData: student.attendanceData,
      riskAnalysis: student.riskAnalysis
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentor/add-test-result/:studentId
// @desc    Add test result for a student
// @access  Private (Mentor)
router.post('/add-test-result/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const testData = req.body;

    const student = await User.findOne({
      _id: studentId,
      mentorId: req.user._id,
      organizationId: req.user.organizationId
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.addTestResult({
      ...testData,
      date: new Date(testData.date)
    });
    await student.save();

    res.json({ 
      message: 'Test result added successfully',
      academicData: student.academicData,
      riskAnalysis: student.riskAnalysis
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentor/update-fee-status/:studentId
// @desc    Update fee payment status for a student
// @access  Private (Mentor)
router.post('/update-fee-status/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { paymentData } = req.body;

    const student = await User.findOne({
      _id: studentId,
      mentorId: req.user._id,
      organizationId: req.user.organizationId
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fee data
    if (!student.feeData) {
      student.feeData = {
        totalFeeAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        paymentStatus: 'pending',
        paymentHistory: []
      };
    }

    // Add payment to history if provided
    if (paymentData.amount && paymentData.amount > 0) {
      student.feeData.paymentHistory.push({
        amount: paymentData.amount,
        paymentDate: new Date(paymentData.paymentDate || Date.now()),
        paymentMethod: paymentData.paymentMethod || 'cash',
        receiptNumber: paymentData.receiptNumber || `RCP${Date.now()}`,
        description: paymentData.description || ''
      });

      student.feeData.paidAmount += paymentData.amount;
      student.feeData.pendingAmount = Math.max(0, student.feeData.totalFeeAmount - student.feeData.paidAmount);
      student.feeData.lastPaymentDate = new Date();
    }

    // Update payment status
    if (paymentData.totalFeeAmount) {
      student.feeData.totalFeeAmount = paymentData.totalFeeAmount;
      student.feeData.pendingAmount = Math.max(0, paymentData.totalFeeAmount - student.feeData.paidAmount);
    }

    if (paymentData.dueDate) {
      student.feeData.dueDate = new Date(paymentData.dueDate);
    }

    // Determine payment status
    if (student.feeData.pendingAmount <= 0) {
      student.feeData.paymentStatus = 'paid';
    } else if (student.feeData.paidAmount > 0) {
      student.feeData.paymentStatus = 'partial';
    } else if (student.feeData.dueDate && new Date() > student.feeData.dueDate) {
      student.feeData.paymentStatus = 'overdue';
    } else {
      student.feeData.paymentStatus = 'pending';
    }

    student.feeData.lastUpdated = new Date();

    // Recalculate risk analysis
    student.calculateRiskAnalysis();
    await student.save();

    res.json({ 
      message: 'Fee status updated successfully',
      feeData: student.feeData,
      riskAnalysis: student.riskAnalysis
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
