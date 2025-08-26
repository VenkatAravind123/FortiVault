const express = require('express');
const response = express.Router();
const { register, login,verifyToken } = require('../controllers/authController.jsx');
const auth = require('../middleware/auth.jsx');


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




module.exports = response;