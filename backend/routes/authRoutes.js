const express = require('express');
const router = express.Router();
const { register, getAllUsers, login, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.get('/users', protect, authorize(['Admin','Employee']), getAllUsers);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
