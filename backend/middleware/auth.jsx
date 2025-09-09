const jwt = require('jsonwebtoken');

// const auth = (req, res, next) => {
//     const token = req.cookies.token; // <-- Read from cookie
//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             message: 'Authentication token required'
//         });
//     }
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         req.userId = decoded.userId;
//         next();
//     } catch (error) {
//         console.error('Auth middleware error:', error);
//         return res.status(401).json({
//             success: false,
//             message: 'Invalid or expired token'
//         });
//     }
// };

// const auth = (req, res, next) => {
//   const token = req.cookies.token; // <-- Read from cookie
//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Authentication token required' });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//   }
// };
// module.exports = auth;

// Example: d:\TERMPAPER\backend\middleware\auth.js


const auth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.userId;
        req.role = decoded.role; // <-- Make sure this is set!
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = auth;