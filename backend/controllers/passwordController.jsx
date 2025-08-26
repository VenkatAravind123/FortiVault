const User = require('../models/User.js')
const addPassword = async (req, res) => {
    try {
        const { website, websiteUrl, username, password } = req.body;
        if (!website || !password) {
            return res.json({ success: false, message: "Website and password are required" });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.passwords.push({
            website,
            websiteUrl,
            username,
            password
        });

        await user.save();
        res.json({ success: true, message: "Password added successfully" });
    } catch (error) {
        console.error('Error adding password:', error);
        res.status(500).json({ success: false, message: 'Failed to add password' });
    }
};

const getPasswords = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Just return the passwords as they are in the DB
        res.json({ success: true, passwords: user.passwords || [] });
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch passwords' });
    }
};
const deletePassword = async (req, res) => {
    try {
        const { passwordId } = req.params;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Remove the password with the given _id from the passwords array
        user.passwords = user.passwords.filter(pw => pw._id.toString() !== passwordId);
        await user.save();

        res.json({ success: true, message: "Password deleted successfully", passwords: user.passwords });
    } catch (error) {
        console.error('Error deleting password:', error);
        res.status(500).json({ success: false, message: 'Failed to delete password' });
    }
};

module.exports = { addPassword, getPasswords, deletePassword }
