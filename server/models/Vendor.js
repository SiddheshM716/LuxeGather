const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['venue', 'catering', 'decorations', 'entertainment', 'photography'] 
  },
  price: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  features: [{ type: String }],
  rating: { type: Number, default: 5.0 }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
