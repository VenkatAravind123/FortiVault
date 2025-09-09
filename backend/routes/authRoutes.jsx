const express = require('express');
const response = express.Router();
const { register, login,verifyToken,getAllUsers,getStats,promoteUser,deleteUser } = require('../controllers/authController.jsx');
const auth = require('../middleware/auth.jsx');
const adminAuth = require('../middleware/adminAuth.jsx');


//Auth Routes
response.post('/register', register);
response.post('/login', login);
response.get('/verify',auth,verifyToken);
response.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true, message: 'Logged out successfully' });
});


//ADmin Routes
response.get('/admin/users', auth, adminAuth, getAllUsers);
response.get('/admin/stats', auth, adminAuth, getStats);
response.put('/admin/users/:id/promote', auth, adminAuth, promoteUser);
response.delete('/admin/users/:id', auth, adminAuth, deleteUser);


module.exports = response;