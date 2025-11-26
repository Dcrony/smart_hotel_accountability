const express = require('express');
const {
    registerUser,
    loginUser,
    getUsers,
    deleteUser,
    updateUserRole
} = require('../controllers/authController');

const { protect, adminGuard } = require('../middleware/auth');

const router = express.Router();

router.post('/register', protect, adminGuard, registerUser);
router.post('/login', loginUser);

// ✅ Admin user management
router.get('/users', protect, adminGuard, getUsers);
router.delete('/users/:id', protect, adminGuard, deleteUser);
router.put('/users/:id/role', protect, adminGuard, updateUserRole);

module.exports = router;
