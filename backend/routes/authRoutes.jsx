const express = require('express');
const response = express.Router();
const { register, login,verifyToken } = require('../controllers/authController.jsx');
const auth = require('../middleware/auth.jsx');


//Auth Routes
response.post('/register', register);
response.post('/login', login);
response.get('/verify',auth,verifyToken);





module.exports = response;