
const User = require('../models/userModel');
const StudentData = require('../models/studentDataModel');
const InvitationCode = require('../models/invitationCodeModel'); // Import new model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user via invitation code
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password, invitationCode } = req.body;

  if (!name || !email || !password || !invitationCode) {
    return res.status(400).json({ message: 'Please add all fields, including invitation code' });
  }

  try {
    // 1. Validate Invitation Code
    const code = await InvitationCode.findOne({ code: invitationCode });
    if (!code) {
      return res.status(400).json({ message: 'Invalid invitation code' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user with role and organization from the code
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: code.role, // Role comes from the code
      organization: code.organization, // Organization comes from the code
    });

    // If the user is a student, create an associated studentData document
    if (user.role === 'student') {
      await StudentData.create({ user: user._id, organization: user.organization });
    }

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Register a new admin user
 * @route   POST /api/users/register-admin
 * @access  Public
 */
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with 'admin' role
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // Admin gets a token to proceed to org creation
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check for user by email
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  registerAdmin,
  loginUser,
};
