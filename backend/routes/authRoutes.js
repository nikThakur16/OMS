const express = require('express');
const router = express.Router();
const { register, getAllUsers, login,logout } = require('../controllers/authController');

router.post('/register', register);
router.get('/users', getAllUsers);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
