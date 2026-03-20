const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true, enum: ['Birthdays', 'Marriages', 'Conferences'] },
  eventParams: {
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    catering: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    decorations: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    entertainment: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    photography: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  },
  filters: {
    guestCount: { type: Number, required: true },
    budget: { type: Number, required: true },
    startDateTime: { type: String, required: true },
    endDateTime: { type: String, required: true },
    location: { type: String, required: true },
  },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
