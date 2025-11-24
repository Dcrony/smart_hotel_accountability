const jwt = require('jsonwebtoken');
const User = require('../models/User'); 


const createToken = (id, role) => {

    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d' 
    });
};


    const { username, password, fullName, role } = req.body;

    // Basic validation
    if (!username || !password || !fullName) {
        return res.status(400).json({ message: 'Please enter all required fields: username, password, and full name.' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'User with that username already exists.' });
        }

        const allowedRoles = ['Staff', 'Admin'];
        let assignedRole = 'Staff';
        if (role && allowedRoles.includes(role)) {
            assignedRole = role;
    }

        
        const user = await User.create({ username, password, fullName, role: assignedRole });

        const token = createToken(user._id, user.role);

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
        res.status(500).json({
            message: 'Error registering user.',
            error: error.message
        });
    }





exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or user is inactive.' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = createToken(user._id, user.role);

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