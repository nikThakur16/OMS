const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Make sure this path is correct

// Route for employee check-in. Requires authentication.
router.post('/check-in', protect, attendanceController.checkIn);

// Route for employee check-out. Requires authentication.
router.post('/check-out', protect, attendanceController.checkOut);

// Route to get all attendance records (for Admin). Requires authentication and Admin role.
router.get('/', protect, authorize(['Admin']), attendanceController.getAllAttendance);

// Route to get attendance for a specific employee. Requires authentication.
// An employee can view their own, an Admin can view any employee.
router.get('/:employeeId', protect, attendanceController.getEmployeeAttendance);

module.exports = router; 