
const express = require('express');
const { registerUser, registerAdmin } = require('../controllers/userController'); // Add registerAdmin
const router = express.Router();

router.post('/register', registerUser);
router.post('/register-admin', registerAdmin); // Add the new admin registration route

module.exports = router;
