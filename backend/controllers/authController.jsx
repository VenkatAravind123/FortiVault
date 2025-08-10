const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//For session management
// const verifyToken = (req, res) => {
//     try {
//         const token = req.headers.authorization?.split(" ")[1];
//         if (!token) {
//             return res.status(401).json({ message: "No token provided" });
//         }

//         jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
//             if (err) {
//                 return res.status(401).json({ message: "Session expired" });
//             }
//             res.json({ message: "Token valid", user: decoded });
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };

const verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-masterPassword -passwords');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error verifying token' });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, masterPassword } = req.body;

        // Input validation
        if (!name || !email || !masterPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check for existing user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(masterPassword, 12);
        const user = new User({
            name,
            email,
            masterPassword: hashedPassword
        });

        await user.save();

        // Generate token with error handling
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        // Set token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// ...rest of your code...
const login = async (req, res) => {
    try {
        const { email, masterPassword } = req.body;

        const user = await User.findOne({ email }).select('+masterPassword');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(masterPassword, user.masterPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        // Set token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

module.exports = {
    register,login,verifyToken
}