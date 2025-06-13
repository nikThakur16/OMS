// backend/controllers/userController.js
const User = require('../models/User'); // Assuming you have a User model

const mongoose = require('mongoose'); // Ensure mongoose is imported for isValidObjectId

// @desc    Get a single user by ID with attendance details
// @route   GET /api/users/:id
// @access  Private (e.g., admin or the user themselves)
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        const user = await User.findById(id).select('-password'); // Exclude password from user data
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch attendance records for this user
        // Assuming employeeId in Attendance model matches the _id of the User
       

        // Combine user details and attendance records
     

        res.status(200).json(userDetailsWithAttendance);
    } catch (error) {
        console.error("Error fetching user by ID with attendance:", error); // Updated error log
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// ... other user-related functions (login, register, etc.)