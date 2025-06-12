const Attendance = require('../models/Attendance');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper to format seconds into "Xhr Ymin" (can be shared or moved to a utils file)
const formatDuration = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return '00hr 00min';
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}hr ${String(minutes).padStart(2, '0')}min`;
};

// Helper to parse "HH:mm AM/PM" into Date for calculation
const parseTime = (timeString, date) => {
    const [time, meridiem] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (meridiem === 'PM' && hours < 12) {
        hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
    }
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
};

// ✅ GET ALL ATTENDANCE (Admin Only)
exports.getAllAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({})
            .sort({ date: -1, 'employeeName': 1 });

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching all attendance records:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ✅ GET ATTENDANCE FOR SPECIFIC EMPLOYEE
exports.getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { date, startDate, endDate } = req.query;

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'Invalid employee ID format.' });
        }

        let query = { employeeId };

        // Handle date range queries correctly
        if (date) {
            const specificDate = new Date(date);
            if (isNaN(specificDate.getTime())) {
                return res.status(400).json({ message: 'Invalid date format provided.' });
            }
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            query.date = { $gte: specificDate, $lt: nextDay };
        } else if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ message: 'Invalid start or end date format provided.' });
            }
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);

            query.date = { $gte: start, $lte: end };
        }

        const attendanceRecords = await Attendance.find(query).sort({ date: -1 });

        if (attendanceRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for this employee based on the provided criteria.' });
        }

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching employee attendance records:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Handle all attendance updates (check-in, check-out, break, resume)
// @route   POST /api/attendance/update
// @access  Private (assuming authentication)
exports.updateAttendance = async (req, res) => {
  const { type, checkInTime, checkOutTime } = req.body; // Only directly destructure necessary time values
  const employeeId = req.user.id;
  let employeeName = req.user.name // Assuming firstName and lastName are available from auth middleware

  if (!employeeId) {
    return res.status(401).json({ message: 'Employee ID not found. Authentication required.' });
  }

  // Fallback to fetch employee name if not available from token
  if (!employeeName || employeeName.trim() === '') {
    try {
      const user = await User.findById(employeeId).select('personalDetails.firstName personalDetails.lastName');
      if (user && user.personalDetails) {
        employeeName = `${user.personalDetails.firstName || ''} ${user.personalDetails.lastName || ''}`.trim();
      } else {
        employeeName = "Unknown Employee";
      }
    } catch (err) {
      console.error("Error fetching employee name for attendance:", err);
      employeeName = "Unknown Employee";
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day for accurate daily record lookup

  try {
    let attendanceRecord = await Attendance.findOne({
      employeeId: employeeId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }, // Query for today's date range
    });

    switch (type) {
      case 'checkIn':
        if (attendanceRecord) {
            if (attendanceRecord.checkInTime) {
                return res.status(400).json({ message: 'Already checked in for today.' });
            }
            // If record exists but no checkInTime (e.g., from previous day's creation), update it
            attendanceRecord.checkInTime = checkInTime;
            attendanceRecord.status = 'Checked In';
            attendanceRecord.totalBreakDurationInSeconds = 0;
            attendanceRecord.currentBreakStartTime = null;
        } else {
            // Create a new attendance record if none exists for today
            attendanceRecord = new Attendance({
                employeeId: employeeId,
                employeeName: employeeName,
                date: today, // Store as a Date object
                checkInTime: checkInTime,
                status: 'Checked In',
                totalBreakDurationInSeconds: 0,
                currentBreakStartTime: null,
            });
        }
        break;

      case 'checkOut':
        if (!attendanceRecord || !attendanceRecord.checkInTime || attendanceRecord.status === 'Checked Out') {
          return res.status(400).json({ message: 'Not checked in or already checked out for today.' });
        }
        if (attendanceRecord.status === 'On Break' && attendanceRecord.currentBreakStartTime) {
            // Automatically resume work if trying to check out while on break
            const breakStartTime = new Date(attendanceRecord.currentBreakStartTime);
            const breakDurationInSeconds = (new Date().getTime() - breakStartTime.getTime()) / 1000;
            attendanceRecord.totalBreakDurationInSeconds += breakDurationInSeconds;
            attendanceRecord.currentBreakStartTime = null;
        }

        attendanceRecord.checkOutTime = checkOutTime;

        // Calculate working hours and overtime
        let workingHoursInSeconds = 0;
        let overtimeInSeconds = 0;
        const standardWorkDaySeconds = 8 * 60 * 60; // 8 hours standard day

        if (attendanceRecord.checkInTime && checkOutTime) {
            const checkInDateTime = parseTime(attendanceRecord.checkInTime, attendanceRecord.date);
            const checkOutDateTime = parseTime(checkOutTime, today); // Use today's date to ensure consistency

            // Total time elapsed minus total break time
            workingHoursInSeconds = (checkOutDateTime.getTime() - checkInDateTime.getTime()) / 1000;
            workingHoursInSeconds = workingHoursInSeconds - attendanceRecord.totalBreakDurationInSeconds;

            if (workingHoursInSeconds > standardWorkDaySeconds) {
                overtimeInSeconds = workingHoursInSeconds - standardWorkDaySeconds;
                workingHoursInSeconds = standardWorkDaySeconds; // Cap working hours at standard for display
            }
        }

        attendanceRecord.workingHours = formatDuration(Math.max(0, workingHoursInSeconds));
        attendanceRecord.breakTime = formatDuration(attendanceRecord.totalBreakDurationInSeconds);
        attendanceRecord.overtime = formatDuration(Math.max(0, overtimeInSeconds)); // Ensure overtime is not negative

        attendanceRecord.status = 'Checked Out';
        // Clear break states after checkout
        attendanceRecord.totalBreakDurationInSeconds = 0;
        attendanceRecord.currentBreakStartTime = null;
        break;

      case 'takeBreak':
        if (!attendanceRecord || attendanceRecord.status !== 'Checked In') {
          return res.status(400).json({ message: 'Cannot take a break. Please check in first or resume work.' });
        }
        if (attendanceRecord.currentBreakStartTime) {
          return res.status(400).json({ message: 'Already on a break.' });
        }
        attendanceRecord.currentBreakStartTime = new Date(); // Store actual Date object
        attendanceRecord.status = 'On Break';
        break;

      case 'resumeWork':
        if (!attendanceRecord || attendanceRecord.status !== 'On Break') {
          return res.status(400).json({ message: 'Not on a break to resume work.' });
        }
        if (!attendanceRecord.currentBreakStartTime) {
            return res.status(400).json({ message: 'Break start time not recorded to resume work.' });
        }
        const breakStartTime = new Date(attendanceRecord.currentBreakStartTime);
        const breakDurationInSeconds = (new Date().getTime() - breakStartTime.getTime()) / 1000;

        attendanceRecord.totalBreakDurationInSeconds = (attendanceRecord.totalBreakDurationInSeconds || 0) + breakDurationInSeconds;
        attendanceRecord.currentBreakStartTime = null; // Clear current break start
        attendanceRecord.status = 'Checked In';
        break;

      default:
        return res.status(400).json({ message: 'Invalid attendance action type provided.' });
    }

    await attendanceRecord.save();
    res.status(200).json(attendanceRecord);
  } catch (error) {
    console.error(`Server error during attendance update (${type}):`, error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error during attendance update.' });
  }
};
