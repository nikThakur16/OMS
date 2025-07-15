const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User model is needed for some checks
const Project = require('../models/Project'); // <-- ADD THIS
const Task = require('../models/Task');       // <-- ADD THIS

const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key"; // Use the same secret as in authController.js

exports.protect = async (req, res, next) => {
    let token;

    // Check if token is sent in cookies (preferred for HTTP-only cookies)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // Alternatively, check if token is sent in Authorization header (less secure for JWTs)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        // Attach the user (from token payload) to the request object
        // If you need more user details, you can fetch them from the DB:
        const user = await User.findById(decoded.user?.id).select('-password'); // Fetch user details but exclude password
        
        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        
        req.user = user;
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

exports.canModifyProjectContent = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.personalDetails.role;

        if (['Admin', 'HR'].includes(userRole)) {
            return next();
        }

        let projectId;
        let task = null;

        if (req.params.projectId) {
            projectId = req.params.projectId;
        } else if (req.params.id) {
            task = await Task.findById(req.params.id);
            if (task) {
                projectId = task.project;
            }
        }

        if (!projectId) {
            return res.status(400).json({ message: 'Project context could not be determined for authorization.' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Associated project not found.' });
        }

        const isManager = project.manager && project.manager.toString() === userId.toString();
        const isProjectAssigned = project.assignedTo.map(id => id.toString()).includes(userId.toString());

        let isTaskAssigned = false;
        if (task && task.assignedTo.map(id => id.toString()).includes(userId.toString())) {
            isTaskAssigned = true;
        }

        if (isManager || isProjectAssigned || isTaskAssigned) {
            return next();
        }

        return res.status(403).json({ message: 'Access denied. You are not authorized to modify content for this project.' });

    } catch (error) {
        console.error("Authorization error in canModifyProjectContent:", error);
        res.status(500).json({ message: 'Server error during authorization.' });
    }
};

exports.canModifyProject = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.personalDetails.role;
        const projectId = req.params.id || req.params.projectId;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required.' });
        }

        // Admins and HR can always edit
        if (['Admin', 'HR'].includes(userRole)) {
            return next();
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Allow the manager to edit
        if (project.manager && project.manager.toString() === userId.toString()) {
            return next();
        }

        return res.status(403).json({ message: 'Access denied. Only the project manager, Admin, or HR can edit this project.' });
    } catch (error) {
        console.error("Authorization error in canModifyProject:", error);
        res.status(500).json({ message: 'Server error during authorization.' });
    }
};

// Optional: Middleware to check user roles
exports.authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!req.user || (roles.length > 0 && !roles.includes(req.user.personalDetails.role))) {
            return res.status(403).json({
                message: `User role ${req.user?.personalDetails?.role || "unknown"} is not authorized to access this route`,
            });
        }
        next();
    };
};