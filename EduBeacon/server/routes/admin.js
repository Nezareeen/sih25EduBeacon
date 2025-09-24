const express = require('express');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Department = require('../models/Department');
const Timetable = require('../models/Timetable');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(adminAuth);

// @route   POST /api/admin/organization
// @desc    Create organization (for existing admin)
// @access  Private (Admin)
router.post('/organization', async (req, res) => {
  try {
    const { name, description } = req.body;

    const organization = new Organization({
      name,
      description,
      adminId: req.user.id
    });

    await organization.save();

    // Update admin with organization ID
    await User.findByIdAndUpdate(req.user.id, { organizationId: organization._id });

    res.status(201).json(organization);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user (mentor/student) in organization
// @access  Private (Admin)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    if (!['mentor', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be mentor or student' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      organizationId: req.user.organizationId
    });

    // Generate unique code
    const uniqueCode = user.generateUniqueCode();
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        uniqueCode: user.uniqueCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users in organization
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ 
      organizationId: req.user.organizationId,
      role: { $in: ['mentor', 'student'] }
    }).select('-password');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/mentors
// @desc    Get mentors in organization
// @access  Private (Admin)
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ 
      organizationId: req.user.organizationId,
      role: 'mentor'
    }).select('_id name email');
    res.json(mentors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/students
// @desc    Get students in organization
// @access  Private (Admin)
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ 
      organizationId: req.user.organizationId,
      role: 'student'
    }).select('_id name email mentorId');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/assign-mentor
// @desc    Assign a mentor to a student
// @access  Private (Admin)
router.post('/assign-mentor', async (req, res) => {
  try {
    const { studentId, mentorId } = req.body;
    if (!studentId || !mentorId) {
      return res.status(400).json({ message: 'studentId and mentorId are required' });
    }

    const [student, mentor] = await Promise.all([
      User.findOne({ _id: studentId, organizationId: req.user.organizationId }),
      User.findOne({ _id: mentorId, organizationId: req.user.organizationId })
    ]);

    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ message: 'Invalid mentor' });
    }

    student.mentorId = mentor._id;
    await student.save();

    res.json({ message: 'Mentor assigned successfully', studentId, mentorId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/timetable/:userId
// @desc    Get timetable for a specific user (by admin)
// @access  Private (Admin)
router.get('/timetable/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId, organizationId: req.user.organizationId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const timetable = await Timetable.findOne({ userId, organizationId: req.user.organizationId });
    res.json(timetable || { events: [], weekStart: null, weekEnd: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/timetable/:userId
// @desc    Create or update timetable for a specific user (by admin)
// @access  Private (Admin)
router.post('/timetable/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { events, weekStart, weekEnd } = req.body;

    const user = await User.findOne({ _id: userId, organizationId: req.user.organizationId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const timetable = await Timetable.findOneAndUpdate(
      { userId, organizationId: req.user.organizationId },
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

// @route   POST /api/admin/departments
// @desc    Create department
// @access  Private (Admin)
router.post('/departments', async (req, res) => {
  try {
    const { name, description } = req.body;

    const department = new Department({
      name,
      description,
      organizationId: req.user.organizationId
    });

    await department.save();

    res.status(201).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/departments
// @desc    Get all departments in organization
// @access  Private (Admin)
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find({ 
      organizationId: req.user.organizationId 
    });

    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/update-student/:id
// @desc    Update student data (including roll number)
// @access  Private (Admin)
router.put('/update-student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await User.findOneAndUpdate(
      { 
        _id: id, 
        organizationId: req.user.organizationId,
        role: 'student'
      },
      updateData,
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
