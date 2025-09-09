const adminAuth = (req, res, next) => {
    // req.role is set by your auth middleware
    if (req.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

module.exports = adminAuth;