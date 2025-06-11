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
        type: String, // Storing as string for time format (e.g., "09:00 AM")
        default: null
    },
    checkOutTime: {
        type: String, // Storing as string for time format
        default: null
    },
    status: { // e.g., 'Present', 'Absent', 'Half Day', 'Checked In', 'Checked Out'
        type: String,
        enum: ['Present', 'Absent', 'Half Day', 'Checked In', 'Checked Out'],
        default: 'Present'
    },
    workingHours: {
        type: String,
        default: '00hr 00min'
    },
    breakTime: {
        type: String,
        default: '00min'
    },
    overtime: {
        type: String,
        default: '00hr 00min'
    }
}, { timestamps: true });

// Add a unique index to prevent duplicate attendance records for the same employee on the same day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 