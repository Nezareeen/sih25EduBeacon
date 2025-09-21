
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const organizationRoutes = require('./routes/organizationRoutes'); // Import organization routes

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// Basic route for testing
app.get('/', (req, res) => {
  res.send('EduBeacon API is running...');
});

// API Routes
app.use('/api/users', userRoutes); // Use user routes
app.use('/api/organizations', organizationRoutes); // Use organization routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
