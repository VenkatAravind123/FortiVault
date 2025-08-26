const express = require('express');
const router = express.Router();
const {addPassword,getPasswords,deletePassword} = require('../controllers/passwordController.jsx');
const auth = require('../middleware/auth.jsx');

router.post('/add',auth,addPassword);
router.get('/getpasswords', auth, getPasswords); // <-- Add this line
router.delete('/delete/:passwordId', auth, deletePassword); // <-- Add this line


module.exports = router;