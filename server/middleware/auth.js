const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Middleware to protect routes, checking for valid JWT in Authorization header
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in headers: "Authorization: Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user (minus the password) and role to the request object
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user || !req.user.isActive) {
                 return res.status(401).json({ message: 'Not authorized, user not found or inactive.' });
            }
            
            req.role = decoded.role; // Also attach the role for role-based access control
            
            next();

        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};


// @desc    Middleware to check if the user has an 'Admin' role
exports.adminGuard = (req, res, next) => {
    // The protect middleware should run first and set req.role
    if (req.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
    next();
};