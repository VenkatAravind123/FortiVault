const User = require('../models/User.js')
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const secretKey = process.env.AES_SECRET_KEY || 'default_secret_key_32_chars_long!';
const ivLength = 16; // AES block size

function encrypt(text) {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'utf8'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'utf8'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


const addPassword = async (req,res)=>{
    try{
        const {website,websiteUrl,username,password} = req.body;
        if(!website || !password){
            return res.json({success:false,message:"Website and password are required"});
        }

        const user  = await User.findById(req.userId);
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }
        const encryptedPassword = encrypt(password);
        user.passwords.push({
            website,
            websiteUrl,
            username,
            password: encryptedPassword
        })
        console.log(encryptedPassword)
        await user.save();
        res.json({success:true,message:"Password added successfully"});
    }
    catch(error){
        console.error('Error adding password:', error);
        res.status(500).json({ success: false, message: 'Failed to add password' });
    }
}
const getPasswords = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Decrypt passwords before sending
        const decryptedPasswords = (user.passwords || []).map(pw => ({
            ...pw._doc,
            password: decrypt(pw.password)
        }));
        res.json({ success: true, passwords: decryptedPasswords });
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch passwords' });
    }
};


module.exports = { addPassword, getPasswords }