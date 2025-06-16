const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User model
        required: true
    },
    employeeName: {
        type: String, // Denormalize for easier display, or populate from User model
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true // Add an index for faster date queries
    },
    checkInTime: {
        type: Number, // Storing as string for time format (e.g., "09:00 AM")
        default: null
    },
    checkOutTime: {
        type: Number, // Storing as string for time format
        default: null
    },
    status: { // e.g., 'Present', 'Absent', 'Half Day', 'Checked In', 'Checked Out'
        type: String,
        enum: ['Not Checked In', 'Checked In', 'onBreak', 'Checked Out'], // Updated enum values
        default: 'Not Checked In' // Default status
    },
    workingHours: {
        type: Number,
        default: 0
    },
    breakTime: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    },
    totalBreakTime: { // New field to store total break duration in seconds
        type: Number,
        default: 0,
    },
    currentBreakStartTime: { // New field to store the timestamp when a break started
        type: Date, // Store as Date object for accurate time calculation
    },
}, { timestamps: true });

// Add a unique index to prevent duplicate attendance records for the same employee on the same day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 