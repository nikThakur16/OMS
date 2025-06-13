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
  return `${String(hours).padStart(2, "0")}hr ${String(minutes).padStart(2, "0")}min`;
};

// Parse "HH:mm AM/PM" into Date object
const parseTime = (timeString, date) => {
  const [time, meridiem] = timeString.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// ✅ IST Timezone Helpers

const getISTToday = () => {
  const now = new Date();
  const istOffset = 5.5 * 60;
  const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
  istTime.setHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset * 60 * 1000);
};

const toISTDate = (date) => {
  const istOffset = 5.5 * 60;
  const istTime = new Date(date.getTime() + istOffset * 60 * 1000);
  istTime.setHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset * 60 * 1000);
};

// ✅ GET ALL ATTENDANCE (Admin Only)
exports.getAllAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({})
      .populate('employeeId')
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
        return res.status(400).json({ message: "Invalid date format provided." });
      }
      specificDate = toISTDate(specificDate);
      const nextDay = new Date(specificDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: specificDate, $lt: nextDay };
    } 
    else if (startDate && endDate) {
      let start = new Date(startDate);
      let end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid start or end date format provided." });
      }

      start = toISTDate(start);
      end = toISTDate(end);
      end.setHours(23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('employeeId')
      .sort({ date: -1 });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({
        message: "No attendance records found for this employee based on the provided criteria.",
      });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching employee attendance records:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE ATTENDANCE (Check-in, Check-out, Break, Resume)
exports.updateAttendance = async (req, res) => {
  const { type, checkInTime, checkOutTime } = req.body;
  const employeeId = req.user.id;
  let employeeName = req.user.name;

  if (!employeeId) {
    return res.status(401).json({ message: "Employee ID not found. Authentication required." });
  }

  if (!employeeName || employeeName.trim() === "") {
    try {
      const user = await User.findById(employeeId).select("personalDetails.firstName personalDetails.lastName");
      if (user && user.personalDetails) {
        employeeName = `${user.personalDetails.firstName || ""} ${user.personalDetails.lastName || ""}`.trim();
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
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    switch (type) {
      case "checkIn":
        if (attendanceRecord) {
          if (attendanceRecord.status === "Checked In") {
            return res.status(400).json({ message: "Already checked in for today.", attendanceRecord });
          }
          if (!attendanceRecord.checkInTime) {
            attendanceRecord.checkInTime = checkInTime;
          }
          attendanceRecord.status = "Checked In";
          attendanceRecord.totalBreakTime = 0;
          attendanceRecord.currentBreakStartTime = null;
        } else {
          attendanceRecord = new Attendance({
            employeeId,
            employeeName,
            date: today,
            checkInTime,
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
          const breakDuration = (new Date().getTime() - breakStartTime.getTime()) / 60000; //
          attendanceRecord.totalBreakTime += breakDuration;
          attendanceRecord.currentBreakStartTime = null;
        }

        attendanceRecord.checkOutTime = checkOutTime;

        let workingHoursInSeconds = 0;
        let overtimeInSeconds = 0;
        const standardWorkDaySeconds = 8 * 60 * 60;

        if (attendanceRecord.checkInTime && checkOutTime) {
          const checkInDateTime = parseTime(attendanceRecord.checkInTime, attendanceRecord.date);
          const checkOutDateTime = parseTime(checkOutTime, today);

          workingHoursInSeconds =
            (checkOutDateTime.getTime() - checkInDateTime.getTime()) / 1000 -
            attendanceRecord.totalBreakTime;

          if (workingHoursInSeconds > standardWorkDaySeconds) {
            overtimeInSeconds = workingHoursInSeconds - standardWorkDaySeconds;
            workingHoursInSeconds = standardWorkDaySeconds;
          }
        }

        attendanceRecord.workingHours = formatDuration(Math.max(0, workingHoursInSeconds));
        attendanceRecord.breakTime = formatDuration(attendanceRecord.totalBreakTime);
        attendanceRecord.overtime = formatDuration(Math.max(0, overtimeInSeconds));

        attendanceRecord.status = "Checked Out";
        attendanceRecord.totalBreakTime = 0;
        attendanceRecord.currentBreakStartTime = null;
        break;

      case "onBreak":
        if (!attendanceRecord || attendanceRecord.status !== "Checked In") {
          return res.status(400).json({ message: "Cannot take a break. Please check in first or resume work." });
        }
        if (attendanceRecord.currentBreakStartTime) {
          return res.status(400).json({ message: "Already on a break." });
        }
        attendanceRecord.currentBreakStartTime = new Date();
        attendanceRecord.status = "onBreak";
        break;

      case "back":
        console.log(attendanceRecord);
        if (!attendanceRecord || attendanceRecord.status !== "onBreak") {
          return res.status(400).json({ message: "Not on a break to resume work." });
        }
        if (!attendanceRecord.currentBreakStartTime) {
          return res.status(400).json({ message: "Break start time not recorded to resume work." });
        }
        const breakStartTime = new Date(attendanceRecord.currentBreakStartTime);
        const breakDuration = (new Date().getTime() - breakStartTime.getTime()) / 1000;
        attendanceRecord.totalBreakTime =
          (attendanceRecord.totalBreakTime || 0) + breakDuration;
        attendanceRecord.currentBreakStartTime = null;
        attendanceRecord.status = "Checked In";
        break;

      default:
        return res.status(400).json({ message: "Invalid attendance action type provided." });
    }

    await attendanceRecord.save();
    res.status(200).json(attendanceRecord);
  } catch (error) {
    console.error(`Server error during attendance update (${type}):`, error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error during attendance update." });
  }
};
