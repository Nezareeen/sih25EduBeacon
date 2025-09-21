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

module.exports = router;
