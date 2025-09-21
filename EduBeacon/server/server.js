const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');

// Load environment variables (prefer config.env next to this file, fallback to .env)
const configPath = path.join(__dirname, 'config.env');
let result = dotenv.config({ path: configPath, override: true });
if (result.error) {
  // Fallback to default .env resolution if config.env not found
  result = dotenv.config({ override: true });
}

// Force-read GEMINI_API_KEY from config.env to avoid conflicts with other env sources
try {
  if (fs.existsSync(configPath)) {
    const parsed = dotenv.parse(fs.readFileSync(configPath));
    if (parsed.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = parsed.GEMINI_API_KEY;
    }
  }
} catch (e) {
  console.warn('[Startup] Unable to force-load GEMINI_API_KEY from config.env:', e?.message);
}

// Startup diagnostics
const geminiPrefix = (process.env.GEMINI_API_KEY || '').slice(0, 6) || 'MISSING';
console.log('[Startup] GEMINI_API_KEY prefix:', geminiPrefix);
if (!process.env.GEMINI_API_KEY) {
  console.warn('[Startup] GEMINI_API_KEY is not set. The AI chatbot will be disabled until configured.');
}

// Connect to database
connectDB();

const app = express();

// --- CORS Configuration (Hardened, with Preflight) ---
// Allow your Vercel production domain and local dev. Add preview pattern if needed.
const FRONTEND_URL = (process.env.FRONTEND_URL || '').replace(/\/$/, ''); // strip trailing slash
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    const allowed = ALLOWED_ORIGINS.includes(origin) || /https:\/\/.*\.vercel\.app$/.test(origin);
    if (allowed) return callback(null, true);
    console.warn('[CORS] Blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // set true only if you use cookies
  optionsSuccessStatus: 204,
};

// Must be before any routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // explicit preflight handling
// --- End of CORS Configuration ---

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/student', require('./routes/student'));
app.use('/api/mentor', require('./routes/mentor'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'EduBeacon API is running!' });
});

// Debug env (temporary)
app.get('/api/debug/env', (req, res) => {
  const key = process.env.GEMINI_API_KEY || '';
  res.json({
    hasGemini: Boolean(key),
    geminiPrefix: key ? key.slice(0, 6) : null,
    nodeEnv: process.env.NODE_ENV || null,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
