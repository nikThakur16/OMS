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

        // Return user details
        const userDetails = {
            id: user._id,
            personalDetails: user.personalDetails,
            contactDetails: user.contactDetails,
            addressDetails: user.addressDetails,
            bankDetails: user.bankDetails,
            teams: user.teams,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json(userDetails);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        // Validate role
        const allowedRoles = ['Admin', 'Employee', 'HR', 'Manager'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be one of: Admin, Employee, HR, Manager' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the role
        user.personalDetails.role = role;
        await user.save();

        res.status(200).json({ 
            message: 'User role updated successfully',
            user: {
                id: user._id,
                firstName: user.personalDetails.firstName,
                lastName: user.personalDetails.lastName,
                role: user.personalDetails.role,
                email: user.contactDetails.email
            }
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Search users by name or email (for autocomplete)
// @route   GET /api/users/search?q=term
// @access  Private (Admin/HR)
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === '') {
            return res.status(400).json({ message: 'Query is required' });
        }
        // Search by firstName, lastName, or email (case-insensitive)
        const regex = new RegExp(q, 'i');
        const users = await User.find({
            $or: [
                { 'personalDetails.firstName': regex },
                { 'personalDetails.lastName': regex },
                { 'contactDetails.email': regex }
            ]
        }).select('personalDetails.firstName personalDetails.lastName contactDetails.email');
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ... other user-related functions (login, register, etc.)