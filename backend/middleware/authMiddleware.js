const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User model is needed for some checks

const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key"; // Use the same secret as in authController.js

exports.protect = async (req, res, next) => {
    let token;

    // Check if token is sent in cookies (preferred for HTTP-only cookies)
    if (req.cookies.token) {
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
        req.user = await User.findById(decoded.user.id).select('-password'); // Fetch user details but exclude password
        
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        
        // Add the user's ID and role from the token payload directly to req.user for easier access
        req.user.id = decoded.user.id;
        req.user.role = decoded.user.role;


        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Optional: Middleware to check user roles
exports.authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!req.user || (roles.length > 0 && !roles.includes(req.user.role))) {
            return res.status(403).json({ message: `User role ${req.user.role || 'unknown'} is not authorized to access this route` });
        }
        next();
    };
};
