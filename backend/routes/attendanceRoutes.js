const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Make sure this path is correct



// Route to get all attendance records (for Admin). Requires authentication and Admin role.
router.get('/', protect, authorize(['Admin']), attendanceController.getAllAttendance);

// Route to get attendance for a specific employee. Requires authentication.
// An employee can view their own, an Admin can view any employee.
router.get('/:employeeId', protect, attendanceController.getEmployeeAttendance);

// Use a single endpoint for all attendance updates
router.post('/update', protect, attendanceController.updateAttendance); // Ensure you use attendanceController.updateAttendance

module.exports = router; 