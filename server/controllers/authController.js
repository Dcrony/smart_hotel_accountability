const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

// Helper function to create a JWT token
const createToken = (id, role) => {
    // Sign the token using the secret key and user data
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
};

// @route   POST /api/auth/register
// @desc    Register a new staff/admin user (initially only used for setup/admin control)
// @access  Public for initial setup, Admin-only afterwards (enforced by auth route)
exports.registerUser = async (req, res) => {
    const { username, password, fullName, role } = req.body;

    // Basic validation
    if (!username || !password || !fullName) {
        return res.status(400).json({ message: 'Please enter all required fields: username, password, and full name.' });
    }

    try {
        // 1. Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'User with that username already exists.' });
        }

        // 2. Restrict role assignment: only allow 'Staff' or 'Admin'
        const allowedRoles = ['Staff', 'Admin'];
        let assignedRole = 'Staff';
        if (role && allowedRoles.includes(role)) {
            assignedRole = role;
        }

        // If you want to ensure initial user becomes Admin, you can detect userCount === 0 in the route or here.
        // Route-level middleware `checkInitialRegister` already ensures correct initial setup.

        // 3. Create and save the user (password hashing happens in the User model pre-save hook)
        const user = await User.create({ username, password, fullName, role: assignedRole });

        // 4. Create a JWT token for the new user
        const token = createToken(user._id, user.role);

        // 5. Respond with token and user details
        res.status(201).json({
            message: 'User registered successfully.',
            token,
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });

    } catch (error) {
        // Handle Mongoose validation errors or other server errors
        res.status(500).json({
            message: 'Error registering user.',
            error: error.message
        });
    }
};



// @route   POST /api/auth/login
// @desc    Authenticate a user and get a JWT token
// @access  Public
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    try {
        // 1. Find the user by username
        const user = await User.findOne({ username });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or user is inactive.' });
        }

        // 2. Compare the provided password with the hashed password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Create a JWT token
        const token = createToken(user._id, user.role);

        // 4. Respond with token and user details
        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'An error occurred during login.', 
            error: error.message 
        });
    }
};