
const express = require('express');
const router = express.Router();
const { createOrganization, generateInvitationCode } = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have this middleware

// All routes in this file are protected and require an admin to be logged in
router.post('/', protect, createOrganization);
router.post('/generate-code', protect, generateInvitationCode);

module.exports = router;
