const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  fullName: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
