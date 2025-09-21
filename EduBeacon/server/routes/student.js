const express = require('express');
const axios = require('axios');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const { auth, studentAuth } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(studentAuth);

// @route   POST /api/student/chatbot
// @desc    Chat with AI chatbot
// @access  Private (Student)
router.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Load API key with robust fallbacks at request time
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.startsWith('your-')) {
      try {
        const configPath = path.join(__dirname, '..', 'config.env');
        if (fs.existsSync(configPath)) {
          const parsed = dotenv.parse(fs.readFileSync(configPath));
          if (parsed.GEMINI_API_KEY) apiKey = parsed.GEMINI_API_KEY;
        }
        if (!apiKey || apiKey.startsWith('your-')) {
          const dotEnvPath = path.join(__dirname, '..', '.env');
          if (fs.existsSync(dotEnvPath)) {
            const parsed2 = dotenv.parse(fs.readFileSync(dotEnvPath));
            if (parsed2.GEMINI_API_KEY) apiKey = parsed2.GEMINI_API_KEY;
          }
        }
      } catch (e) {
        console.warn('[Chatbot] Fallback load failed:', e?.message);
      }
    }

    // TEMP DEBUG: verify effective API key prefix
    console.log('[Chatbot] GEMINI_API_KEY prefix (effective):', apiKey ? apiKey.slice(0, 6) : 'MISSING');

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      return res.status(503).json({
        message: "AI service is not configured. Please contact your administrator.",
        error: 'GEMINI_API_KEY missing or placeholder',
      });
    }

    // Use supported model and endpoint; allow configuration via env
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

    // Call Gemini API
    const geminiResponse = await axios.post(
      url,
      {
        contents: [{
          parts: [{
            text: `You are an AI counselor for students. Help them with academic and personal issues. Be supportive and encouraging. Student message: ${message}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const aiResponse = geminiResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return res.status(502).json({
        message: 'AI service returned an unexpected response. Please try again later.',
        error: 'Empty candidates from Gemini',
      });
    }

    res.json({
      response: aiResponse,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Chatbot error:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    return res.status(503).json({
      message: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
      error: 'Chatbot upstream failure',
    });
  }
});

// @route   GET /api/student/tips
// @desc    Get personalized study/wellbeing tips for the student
// @access  Private (Student)
router.get('/tips', async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('attendancePct riskLevel');
    const tips = [];
    if (student) {
      if (typeof student.attendancePct === 'number' && student.attendancePct < 75) {
        tips.push('Try to maintain consistent attendance. Plan commute and set reminders.');
      } else {
        tips.push('Great attendance! Keep up the consistency.');
      }
      if (student.riskLevel === 'high') tips.push('Reach out to your mentor if you feel overwhelmed.');
      if (student.riskLevel === 'medium') tips.push('Create a weekly study plan and stick to short, focused sessions.');
      if (student.riskLevel === 'low' || !student.riskLevel) tips.push('Challenge yourself with practice problems to stay sharp.');
    } else {
      tips.push('Set achievable goals for the week and review your progress daily.');
    }
    tips.push('Take short breaks, stay hydrated, and get enough sleep to improve focus.');
    res.json({ tips });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/student/wellbeing
// @desc    Submit mental health/wellbeing survey
// @access  Private (Student)
router.post('/wellbeing', async (req, res) => {
  try {
    const { mood, stress, sleep, notes } = req.body;
    if (mood == null || stress == null || sleep == null) {
      return res.status(400).json({ message: 'mood, stress and sleep are required (1-5)' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wellbeingResponses = user.wellbeingResponses || [];
    user.wellbeingResponses.push({ mood, stress, sleep, notes });

    // rudimentary risk adjustment example
    const avg = (Number(mood) + Number(stress) + Number(sleep)) / 3;
    if (avg <= 2) user.riskLevel = 'high';
    else if (avg <= 3) user.riskLevel = 'medium';
    else user.riskLevel = user.riskLevel || 'low';

    await user.save();
    res.status(201).json({ message: 'Thank you for your response' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/student/timetable
// @desc    Get student timetable
// @access  Private (Student)
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

// @route   POST /api/student/timetable
// @desc    Create or update student timetable
// @access  Private (Student)
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

module.exports = router;
