const express = require('express');
const router = express.Router();

const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.get('/employeeDashboard', protect, attendanceController.getEmployeeDashboardData);
router.get('/', protect, authorize(['Admin']), attendanceController.getAllAttendance);
router.get('/:employeeId', protect, attendanceController.getEmployeeAttendance);
router.post('/update', protect, attendanceController.updateAttendance);


module.exports = router;
