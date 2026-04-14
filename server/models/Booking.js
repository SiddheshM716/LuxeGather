const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true, enum: ['Birthdays', 'Marriages', 'Conferences'] },
  eventParams: {
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    catering: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    decorations: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    entertainment: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    photography: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  },
  filters: {
    guestCount: { type: Number, required: true },
    budget: { type: Number, required: true },
    startDateTime: { type: String },
    endDateTime: { type: String },
    location: { type: String },
  },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  eventStatus: { type: String, enum: ['Planning', 'Confirmed', 'In Progress', 'Completed'], default: 'Planning' },
  vendorConfirmations: {
    venue: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' },
    catering: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' },
    decorations: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' },
    entertainment: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' },
    photography: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' }
  },
  taskChecklist: [{ 
    task: { type: String, required: true }, 
    isCompleted: { type: Boolean, default: false } 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
