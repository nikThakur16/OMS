// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming you have authentication middleware

// Route to get a single user by ID
router.get('/:id', protect, userController.getUserById); // Protect this route if needed

// Route to update user role (Admin only)
router.put('/:id/role', protect, authorize(['Admin']), userController.updateUserRole);

// Route to search users by name or email (autocomplete)
router.get('/search', protect, authorize(['Admin', 'HR']), userController.searchUsers);

// ... other user-related routes (e.g., /api/auth/register, /api/auth/login, /api/auth/users)

module.exports = router;