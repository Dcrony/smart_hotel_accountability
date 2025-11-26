const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// ✅ REGISTER USER (Admin Only)
exports.registerUser = async (req, res) => {
    const { username, password, fullName, role } = req.body;

    if (!username || !password || !fullName) {
        return res.status(400).json({
            message: 'Please enter all required fields: username, password, and full name.'
        });
    }

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({
                message: 'User with that username already exists.'
            });
        }

        const allowedRoles = ['Staff', 'Admin'];
        const assignedRole = allowedRoles.includes(role) ? role : 'Staff';

        const user = await User.create({
            username,
            password,
            fullName,
            role: assignedRole
        });

        res.status(201).json({
            message: 'User created successfully.',
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error creating user.',
            error: error.message
        });
    }
};



exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Invalid credentials or user is inactive.'
            });
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

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      $or: [
        { username: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } }
      ]
    };

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password");

    const total = await User.countDocuments(query);

    // Map _id to id for frontend
    const mappedUsers = users.map(u => ({
      id: u._id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
    }));

    res.json({
      users: mappedUsers,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


exports.updateUserRole = async (req, res) => {
    const { role } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = role;
        await user.save();

        res.json({ message: "Role updated", user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
