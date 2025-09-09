const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  website: {
    type: String,
    required: true
  },
  websiteUrl:{
    type: String
  },
  username: {
    type: String, // optional: email or username used on the site
    default: ''
  },
  password: {
    type: String,
    required: true // this will be AES encrypted
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  masterPassword: {
    type: String,
    required: true // hash this using bcrypt
  },
  role:{
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  passwords: [passwordSchema] // Embedded password list
});

module.exports = mongoose.model('User', userSchema);
