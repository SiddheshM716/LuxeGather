const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Expires in 5 minutes
});

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
