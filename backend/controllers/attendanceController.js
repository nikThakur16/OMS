const Attendance = require("../models/Attendance");
const User = require("../models/User");
const mongoose = require("mongoose");

// ✅ Helpers

// Format duration in "HHhr MMmin"
const formatDuration = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "00hr 00min";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}hr ${String(minutes).padStart(
    2,
    "0"
  )}min`;
};

// Parse "HH:mm AM/PM" into Date object

// ✅ IST Timezone Helpers

const getISTToday = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 5.5 * 60 * 60 * 1000);
  istTime.setHours(0, 0, 0, 0);
  return istTime;
};

const toISTDate = (date) => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 5.5 * 60 * 60 * 1000);
  istTime.setHours(0, 0, 0, 0);
  return istTime;
};

// ✅ GET ALL ATTENDANCE (Admin Only)
exports.getAllAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({})
      .populate("employeeId")
      .sort({
        date: -1,
        employeeName: 1,
      });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching all attendance records:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET ATTENDANCE FOR SPECIFIC EMPLOYEE
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date, startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID format." });
    }

    let query = { employeeId };

    if (date) {
      let specificDate = new Date(date);
      if (isNaN(specificDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid date format provided." });
      }
      specificDate = toISTDate(specificDate);
      const nextDay = new Date(specificDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: specificDate, $lt: nextDay };
    } else if (startDate && endDate) {
      let start = new Date(startDate);
      let end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid start or end date format provided." });
      }

      start = toISTDate(start);
      end = toISTDate(end);
      end.setHours(23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("employeeId")
      .sort({ date: -1 });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({
        message:
          "No attendance records found for this employee based on the provided criteria.",
      });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching employee attendance records:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//employee Dashboard Data
exports.getEmployeeDashboardData = async (req, res) => {
  const employeeId = req.user.id;
  const today = getISTToday();

  // Fetch full user details excluding sensitive fields
  const user = await User.findById(employeeId).select("-password -__v");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Fetch today's attendance
  const attendance = await Attendance.findOne({
    employeeId: employeeId,
    date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
  });

  res.json({ user, attendance });
};

// ✅ UPDATE ATTENDANCE (Check-in, Check-out, Break, Resume)
exports.updateAttendance = async (req, res) => {
  const { type, checkInTime, checkOutTime ,backTime} = req.body;
  const employeeId = req.user.id;
  let employeeName = req.user.name;

  if (!employeeId) {
    return res
      .status(401)
      .json({ message: "Employee ID not found. Authentication required." });
  }

  if (!employeeName || employeeName.trim() === "") {
    try {
      const user = await User.findById(employeeId).select(
        "personalDetails.firstName personalDetails.lastName"
      );
      if (user && user.personalDetails) {
        employeeName = `${user.personalDetails.firstName || ""} ${
          user.personalDetails.lastName || ""
        }`.trim();
      } else {
        employeeName = "Unknown Employee";
      }
    } catch (err) {
      console.error("Error fetching employee name for attendance:", err);
      employeeName = "Unknown Employee";
    }
  }

  const today = getISTToday();

  try {
    let attendanceRecord = await Attendance.findOne({
      employeeId: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    switch (type) {
      case "checkIn":
  if (attendanceRecord) {
    if (attendanceRecord.status === "Checked In") {
      return res.status(400).json({ message: "Already checked in for today." });
    }
    if (!attendanceRecord.checkInTime) {
      attendanceRecord.checkInTime = new Date(checkInTime);
    }
    attendanceRecord.status = "Checked In";
    attendanceRecord.totalBreakTime = 0;
    attendanceRecord.currentBreakStartTime = null;
  } else {
    attendanceRecord = new Attendance({
      employeeId,
      employeeName,
      date: today,
      checkInTime: new Date(checkInTime),  // <-- Always parse to Date object
      status: "Checked In",
      totalBreakTime: 0,
      currentBreakStartTime: null,
    });
  }
  break;


  case "checkOut":
    if (!attendanceRecord || !attendanceRecord.checkInTime || attendanceRecord.status === "Checked Out") {
      return res.status(400).json({ message: "Not checked in or already checked out for today." });
    }
  
    if (attendanceRecord.status === "onBreak" && attendanceRecord.currentBreakStartTime) {
      const breakStartTime = new Date(attendanceRecord.currentBreakStartTime);
      const breakDuration = (new Date() - breakStartTime) / 1000;
      attendanceRecord.totalBreakTime += breakDuration;
      attendanceRecord.currentBreakStartTime = null;
    }
  
    attendanceRecord.checkOutTime = new Date(checkOutTime);
  
    const checkInDateTime = new Date(attendanceRecord.checkInTime);
    const checkOutDateTime = new Date(checkOutTime);
    const totalBreak = attendanceRecord.totalBreakTime || 0;
  
    const totalSeconds = (checkOutDateTime - checkInDateTime) / 1000;
    let workingHoursInSeconds = totalSeconds - totalBreak;
  
    const standardWorkDaySeconds = 8 * 60 * 60;
    let overtimeInSeconds = 0;
  
    if (workingHoursInSeconds > standardWorkDaySeconds) {
      overtimeInSeconds = workingHoursInSeconds - standardWorkDaySeconds;
      workingHoursInSeconds = standardWorkDaySeconds;
    }
  
    attendanceRecord.workingHours = Math.max(0, workingHoursInSeconds);
    attendanceRecord.breakTime = attendanceRecord.totalBreakTime || 0;
    attendanceRecord.overtime = Math.max(0, overtimeInSeconds);
  
    attendanceRecord.status = "Checked Out";
    attendanceRecord.totalBreakTime = 0;
    attendanceRecord.currentBreakStartTime = null;
  
    await attendanceRecord.save();
    break;
    case "onBreak":
      if (!attendanceRecord || attendanceRecord.status !== "Checked In") {
        return res.status(400).json({
          message: "Cannot take a break. Please check in first or resume work.",
        });
      }
    
      if (attendanceRecord.currentBreakStartTime) {
        return res.status(400).json({ message: "Already on a break." });
      }
    
      // Store epoch ms timestamp instead of Date object
      attendanceRecord.currentBreakStartTime = Date.now();  // <-- fixed here ✅
      attendanceRecord.status = "onBreak";
      break;
    


  
case "back":
  if (!attendanceRecord || attendanceRecord.status !== "onBreak") {
    return res.status(400).json({ message: "Not on a break to resume work." });
  }
  if (!attendanceRecord.currentBreakStartTime) {
    return res.status(400).json({ message: "Break start time not recorded." });
  }const breakEnd = new Date(backTime);
  const breakStart = new Date(attendanceRecord.currentBreakStartTime);
  const breakDuration = (breakEnd - breakStart) / 1000;
  
  attendanceRecord.totalBreakTime = (attendanceRecord.totalBreakTime || 0) + breakDuration;
  attendanceRecord.currentBreakStartTime = null;
  attendanceRecord.status = "Checked In";
  await attendanceRecord.save();
  break;


      default:
        return res
          .status(400)
          .json({ message: "Invalid attendance action type provided." });
    }

    await attendanceRecord.save();
    res.status(200).json(attendanceRecord);
  } catch (error) {
    console.error(`Server error during attendance update (${type}):`, error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    res
      .status(500)
      .json({ message: "Internal server error during attendance update." });
  }
};
