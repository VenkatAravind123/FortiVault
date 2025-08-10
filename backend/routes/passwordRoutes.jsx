const express = require('express');
const router = express.Router();
const {addPassword,getPasswords} = require('../controllers/passwordController.jsx');
const auth = require('../middleware/auth.jsx');

router.post('/add',auth,addPassword);
router.get('/getpasswords', auth, getPasswords); // <-- Add this line

module.exports = router;