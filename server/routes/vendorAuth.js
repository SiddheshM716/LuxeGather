const express = require('express');
const Vendor = require('../models/Vendor');
const OtpVerification = require('../models/OtpVerification');
const router = express.Router();

// Shared route for login and register for vendors.
router.post('/request-otp', async (req, res) => {
  try {
    const { identifier } = req.body;
    let vendor = await Vendor.findOne({ identifier });
    
    // Generate mock OTP '1234'
    const otp = '1234';
    
    if (!vendor) {
      vendor = new Vendor({ identifier });
      await vendor.save();
    }
    
    // Store OTP in OtpVerification
    await OtpVerification.findOneAndDelete({ identifier }); // clear existing
    const otpRecord = new OtpVerification({ identifier, otp });
    await otpRecord.save();
    
    res.json({ message: 'Vendor OTP sent successfully (hint: 1234)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    
    const otpRecord = await OtpVerification.findOne({ identifier, otp });
    if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });
    
    const vendor = await Vendor.findOne({ identifier });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    
    vendor.isVerified = true;
    await vendor.save();
    
    // Clear OTP
    await OtpVerification.findByIdAndDelete(otpRecord._id);
    
    res.json({ message: 'OTP verified', user: vendor, role: 'vendor' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/complete-profile', async (req, res) => {
  try {
    const { identifier, username, businessName, category, description, price, imageUrl } = req.body;
    const vendor = await Vendor.findOne({ identifier });
    
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    if (!vendor.isVerified) return res.status(401).json({ error: 'Vendor not verified' });
    
    vendor.username = username;
    if (businessName) vendor.name = businessName;
    if (category) vendor.category = category;
    if (description) vendor.description = description;
    if (price) vendor.price = Number(price);
    if (imageUrl) vendor.imageUrl = imageUrl;
    if (req.body.features && Array.isArray(req.body.features)) vendor.features = req.body.features;
    
    await vendor.save();
    
    res.json({ message: 'Vendor profile completed', user: vendor, role: 'vendor' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
