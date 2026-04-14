const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { user, eventType, eventParams, filters, totalPrice } = req.body;
    
    const defaultChecklist = [
      { task: 'Initial Consultation', isCompleted: true },
      { task: 'Venue Confirmation', isCompleted: false },
      { task: 'Vendor Selection Finalized', isCompleted: false },
      { task: 'Payment Completed', isCompleted: false },
      { task: 'Event Execution', isCompleted: false }
    ];

    const booking = new Booking({
      user,
      eventType,
      eventParams,
      filters,
      totalPrice,
      status: 'pending',
      taskChecklist: defaultChecklist
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

// Get bookings for a specific vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const bookings = await Booking.find({
      $or: [
        { 'eventParams.venue': vendorId },
        { 'eventParams.catering': vendorId },
        { 'eventParams.decorations': vendorId },
        { 'eventParams.entertainment': vendorId },
        { 'eventParams.photography': vendorId }
      ]
    }).populate('user', 'fullName phoneNumber username')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status by vendor
router.put('/:id/vendor-status', async (req, res) => {
  try {
    const { category, status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    // Verify the category exists
    if (booking.vendorConfirmations[category] === undefined) {
      return res.status(400).json({ error: 'Invalid vendor category' });
    }
    
    booking.vendorConfirmations[category] = status;
    await booking.save();
    
    res.json({ message: 'Vendor status updated', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
