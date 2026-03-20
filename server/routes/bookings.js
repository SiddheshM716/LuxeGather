const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { user, eventType, eventParams, filters, totalPrice } = req.body;
    
    const booking = new Booking({
      user,
      eventType,
      eventParams,
      filters,
      totalPrice,
      status: 'pending'
    });
    
    await booking.save();
    res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pay for a booking
router.post('/:id/pay', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    booking.status = 'paid';
    await booking.save();
    
    res.json({ message: 'Payment successful', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
