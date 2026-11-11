
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  // User Name
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Email Address
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  // Hashed Password
  password: {
    type: String,
    required: true
  },

  // User Role
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }

}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
