const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  name: { type: String, default: 'Pending Vendor Name' },
  category: { 
    type: String, 
    enum: ['venue', 'catering', 'decorations', 'entertainment', 'photography', ''],
    default: ''
  },
  price: { type: Number, default: 0 },
  description: { type: String },
  imageUrl: { type: String },
  features: [{ type: String }],
  rating: { type: Number, default: 5.0 }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
