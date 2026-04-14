const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();

// Get all events (bookings) for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('eventParams.venue')
      .populate('eventParams.catering')
      .populate('eventParams.decorations')
      .populate('eventParams.entertainment')
      .populate('eventParams.photography')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
