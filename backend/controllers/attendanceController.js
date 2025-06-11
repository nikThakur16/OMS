const Attendance = require('../models/Attendance');
const User = require('../models/User'); // Used to fetch employee name based on ID
const mongoose = require('mongoose'); // Ensure Mongoose is imported if not already

// @desc    Record employee check-in
// @route   POST /api/attendance/check-in
// @access  Private (Employee token required - `req.user.id` comes from auth middleware)
exports.checkIn = async (req, res) => {
    // IMPORTANT: `employeeId` should come from `req.user.id` via auth middleware
    const employeeId = req.user ? req.user.id : req.body.employeeId; // Fallback for testing, REMOVE in production
    const { checkInTime } = req.body;

    if (!employeeId || !checkInTime) {
        return res.status(400).json({ message: 'Employee ID and Check-in Time are required.' });
    }

    let employeeName = "Unknown Employee";
    try {
        const user = await User.findById(employeeId).select('personalDetails.firstName personalDetails.lastName');
        if (user) {
            employeeName = `${user.personalDetails.firstName} ${user.personalDetails.lastName}`;
        }
    } catch (err) {
        console.error("Error fetching employee name for check-in:", err);
    }

    const today = new Date();
    // Normalize date to start of the day for accurate daily lookups
    today.setHours(0, 0, 0, 0);

    try {
        let attendance = await Attendance.findOne({ employeeId, date: today });
        console.log("Attendance record found:", attendance);

        if (attendance) {
            if (!attendance.checkInTime) {
                // Update existing record if check-in time wasn't set
                attendance.checkInTime = checkInTime;
                attendance.status = 'Checked In';
                await attendance.save();
                return res.status(200).json({ message: 'Check-in recorded successfully', attendance });
            } else {
                return res.status(400).json({ message: 'Already checked in today' });
            }
        } else {
            // Create a new attendance record
            attendance = new Attendance({
                employeeId,
                employeeName,
                date: today,
                checkInTime,
                status: 'Checked In',
            });
            await attendance.save();
            return res.status(201).json({ message: 'Checked in successfully', attendance });
        }
    } catch (error) {
        console.error("Error during check-in:", error);
        res.status(500).json({ message: 'Server error during check-in' });
    }
};

// @desc    Record employee check-out
// @route   POST /api/attendance/check-out
// @access  Private (Employee token required - `req.user.id` comes from auth middleware)
exports.checkOut = async (req, res) => {
    // IMPORTANT: `employeeId` should come from `req.user.id` via auth middleware
    const employeeId = req.user ? req.user.id : req.body.employeeId; // Fallback for testing, REMOVE in production
    const { checkOutTime, workingHours, breakTime, overtime } = req.body;

    if (!employeeId || !checkOutTime) {
        return res.status(400).json({ message: 'Employee ID and Check-out Time are required.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        let attendance = await Attendance.findOne({ employeeId, date: today });

        if (!attendance) {
            return res.status(404).json({ message: 'No check-in record found for today. Cannot check out.' });
        }

        // Update check-out details
        attendance.checkOutTime = checkOutTime;
        attendance.status = 'Checked Out';
        // These can be calculated on the frontend and sent, or calculated here on the backend
        attendance.workingHours = workingHours || attendance.workingHours;
        attendance.breakTime = breakTime || attendance.breakTime;
        attendance.overtime = overtime || attendance.overtime;

        await attendance.save();
        res.status(200).json({ message: 'Checked out successfully', attendance });

    } catch (error) {
        console.error("Error during check-out:", error);
        res.status(500).json({ message: 'Server error during check-out' });
    }
};

// @desc    Get all attendance records (for Admin Dashboard)
// @route   GET /api/attendance
// @access  Private (Admin token required - `req.user.role` check)
exports.getAllAttendance = async (req, res) => {
    try {
        // You can add query parameters for filtering (e.g., by date range, employee)
        // const { startDate, endDate, employeeId } = req.query;
        let query = {};
        // Example: if (startDate && endDate) query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        // Example: if (employeeId) query.employeeId = employeeId;

        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1, 'employeeName': 1 }); // Sort by most recent date first, then by employee name

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching all attendance:", error);
        res.status(500).json({ message: 'Server error fetching attendance records' });
    }
};

// @desc    Get attendance records for a specific employee
// @route   GET /api/attendance/:employeeId
// @access  Private (Employee token required for self, Admin for others)
exports.getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { date, startDate, endDate } = req.query;

        // Validate if the employeeId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'Invalid employee ID format.' });
        }

        let query = { employeeId }; // Start with employeeId filter

        // Add date filtering logic based on query parameters
        if (date) {
            const specificDate = new Date(date);
            specificDate.setUTCHours(0, 0, 0, 0); // Start of the day in UTC
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1); // Start of next day in UTC

            query.date = {
                $gte: specificDate,
                $lt: nextDay
            };
        } else if (startDate && endDate) {
            // For a date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0); // Start of start date
            end.setUTCHours(23, 59, 59, 999); // End of end date (inclusive)

            query.date = {
                $gte: start,
                $lte: end
            };
        }

        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1 }); // Sort by most recent date

        if (attendanceRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for this employee for the specified period.' });
        }

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching employee attendance:", error);
        res.status(500).json({ message: 'Server error fetching employee attendance' });
    }
};
