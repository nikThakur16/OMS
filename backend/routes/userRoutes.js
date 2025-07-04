// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have authentication middleware

// Route to get a single user by ID
router.get('/:id', protect, userController.getUserById); // Protect this route if needed

// ... other user-related routes (e.g., /api/auth/register, /api/auth/login, /api/auth/users)

module.exports = router;