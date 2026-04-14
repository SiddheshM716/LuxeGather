const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/request-otp', async (req, res) => {
  try {
    const { identifier } = req.body;
    let user = await User.findOne({ identifier });
    
    // Generate mock OTP '1234' for all
    const otp = '1234';
    
    if (!user) {
      user = new User({ identifier, otp });
    } else {
      user.otp = otp;
    }
    await user.save();
    
    res.json({ message: 'OTP sent successfully (hint: 1234)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const user = await User.findOne({ identifier });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    
    user.isVerified = true;
    user.otp = null; // clear OTP
    await user.save();
    
    res.json({ message: 'OTP verified', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/complete-profile', async (req, res) => {
  try {
    const { identifier, username, fullName, phoneNumber } = req.body;
    const user = await User.findOne({ identifier });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isVerified) return res.status(401).json({ error: 'User not verified' });
    
    user.username = username;
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    await user.save();
    
    res.json({ message: 'Profile completed', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile route
router.put('/profile/:id', async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

