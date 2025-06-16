const express = require('express');
const router = express.Router();
const { register, getAllUsers, login, logout, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.get('/users', getAllUsers);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
