const express = require('express');
const Booking = require('../models/Booking');
const Razorpay = require('razorpay');
const crypto = require('crypto');
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

// Create Razorpay Order
router.post('/razorpay/order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Razorpay test accounts have a maximum transaction limit (usually 5,00,000 INR).
    // If we're using a test key and the amount exceeds this, cap it for testing purposes.
    const isTestMode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test');
    const finalAmount = isTestMode ? Math.min(amount, 500000) : amount;

    const options = {
      amount: Math.round(finalAmount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ error: 'Failed to create Razorpay order' });

    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Razorpay Payment Signature
router.post('/razorpay/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
