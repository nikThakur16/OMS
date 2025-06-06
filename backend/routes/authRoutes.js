const express = require('express');
const router = express.Router();
const { register, getAllUsers, login } = require('../controllers/authController');

router.post('/register', register);
router.get('/users', getAllUsers);
router.post('/login', login);

module.exports = router;
