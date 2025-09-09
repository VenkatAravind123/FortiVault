const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Example for your verifyToken controller
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
        email: user.email,
        role: user.role // <-- THIS IS IMPORTANT
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error verifying token' });
  }
};


const register = async (req, res) => {
  try {
    const { name, email, masterPassword, role } = req.body;

    // Input validation
    if (!name || !email || !masterPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash the master password
    const hashedPassword = await bcrypt.hash(masterPassword, 12);

    // Create new user with role (defaults to "user" if not provided)
    const user = new User({
      name,
      email,
      masterPassword: hashedPassword,
      role: role || "user", // 🟢 default to "user"
    });

    await user.save();

    // Generate token including role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Set token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 🟢 send role back too
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
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

        // Add role to JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
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
                email: user.email,
                role: user.role // Include role in response
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};


//Admin Controllers

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-masterPassword -passwords');
    const usersWithCount = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      passwordCount: u.passwords ? u.passwords.length : 0
    }));
    res.json({ users: usersWithCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Get system stats (admin only)
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const allUsers = await User.find({}, 'passwords');
    let totalPasswords = 0;
    allUsers.forEach(user => {
      totalPasswords += user.passwords ? user.passwords.length : 0;
    });
    res.json({
      totalUsers,
      totalPasswords
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

// Promote a user to admin (admin only)
const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = 'admin';
    await user.save();
    res.json({
      message: 'User promoted to admin',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to promote user', error: error.message });
  }
};

// Delete a user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

module.exports = {
    register,login,verifyToken,getAllUsers,
  getStats,
  promoteUser,
  deleteUser
}