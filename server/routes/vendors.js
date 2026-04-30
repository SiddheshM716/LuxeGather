const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const upload = require('../middleware/upload');

// Get all vendors grouped by category
router.get('/', async (req, res) => {
  try {
    // Only return vendors who have completed their profiles (meaning they picked a real category, not the default empty string, and are verified)
    const vendors = await Vendor.find({ 
        isVerified: true, 
        category: { $in: ['venue', 'catering', 'decorations', 'entertainment', 'photography'] } 
    });
    
    // Group them
    const grouped = {
      venue: vendors.filter(v => v.category === 'venue'),
      catering: vendors.filter(v => v.category === 'catering'),
      decorations: vendors.filter(v => v.category === 'decorations'),
      entertainment: vendors.filter(v => v.category === 'entertainment'),
      photography: vendors.filter(v => v.category === 'photography')
    };

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Update vendor profile
router.put('/:id/profile', upload.single('image'), async (req, res) => {
  try {
    const { features, description, price } = req.body;
    
    // Parse features if they come as a string (common with FormData)
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split(',').map(f => f.trim());
      }
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    
    if (parsedFeatures && Array.isArray(parsedFeatures)) vendor.features = parsedFeatures;
    if (description) vendor.description = description;
    if (price !== undefined) vendor.price = Number(price);
    
    // Update imageUrl if a new file was uploaded
    if (req.file) {
      vendor.imageUrl = req.file.path;
    }
    
    await vendor.save();
    
    res.json({ message: 'Profile updated successfully', vendor });
  } catch (error) {
    console.error('Vendor profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
// Rate vendor
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating, userId } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    
    const existingRatingIndex = vendor.ratings.findIndex(r => r.userId.toString() === userId);
    
    if (existingRatingIndex !== -1) {
      // User already rated, update their rating
      const oldRating = vendor.ratings[existingRatingIndex].rating;
      vendor.ratings[existingRatingIndex].rating = Number(rating);
      
      const currentCount = vendor.ratingCount || 1;
      // Recalculate average: remove old rating, add new rating
      const currentTotal = (vendor.rating || 5.0) * currentCount;
      vendor.rating = (currentTotal - oldRating + Number(rating)) / currentCount;
    } else {
      // New rating
      vendor.ratings.push({ userId, rating: Number(rating) });
      const currentCount = vendor.ratingCount || 1;
      const currentRating = vendor.rating || 5.0;
      
      const newCount = currentCount + 1;
      vendor.rating = ((currentRating * currentCount) + Number(rating)) / newCount;
      vendor.ratingCount = newCount;
    }
    
    await vendor.save();
    
    res.json({ message: 'Rating submitted successfully', vendor });
  } catch (error) {
    console.error('Vendor rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Seed data
router.post('/seed', async (req, res) => {
  try {
    // Only delete previously seeded vendors so manual registrations are preserved
    await Vendor.deleteMany({ identifier: { $regex: /^seed_vendor_/ } });
    
    const seedData = [
      // Venues
      { name: 'The Grand Palace', category: 'venue', price: 1200000, description: 'Royal heritage estate', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800', features: ['Valet Parking', 'Presidential Suites', 'Helipad', 'Grand Ballroom'] },
      { name: 'Oceanview Resort', category: 'venue', price: 720000, description: 'Private beach access', imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800', features: ['Private Beach', 'Infinity Pool', 'Seaside Cabanas'] },
      { name: 'Metropolitan Hall', category: 'venue', price: 320000, description: 'Modern downtown venue', imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800', features: ['City Skyline View', 'High-speed WiFi', 'Modern Architecture'] },
      
      // Catering
      { name: 'Cuisine Divine', category: 'catering', price: 8000, description: 'Global fusion menu', imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800', features: ['Italian & Mediterranean', 'Vegan Options', 'Live Stations'] },
      { name: 'The Michelin Touch', category: 'catering', price: 20000, description: 'Award-winning chef team', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800', features: ['10-Course Tasting', 'Sommelier Selection', 'Truffle & Caviar Bar'] },
      { name: 'Rustic Bites', category: 'catering', price: 4800, description: 'Locally-sourced organic menu', imageUrl: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&q=80&w=800', features: ['Farm-to-table', 'BBQ Grill', 'Craft Beers'] },
      
      // Decorations
      { name: 'Elegance & Co.', category: 'decorations', price: 480000, description: 'Complete floral & lighting design', imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800', features: ['Orchids & Roses', 'Crystal Chandeliers', 'Custom Dancefloor'] },
      { name: 'Minimalist Magic', category: 'decorations', price: 200000, description: 'Modern chic aesthetics', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800', features: ['Fairy Lights', 'Succulent Centerpieces', 'Neutral Palettes'] },
      { name: 'Imperial Designs', category: 'decorations', price: 1200000, description: 'Over-the-top bespoke structures', imageUrl: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80&w=800', features: ['Ice Sculptures', 'Fireworks', 'Custom Built Sets'] },
      
      // Entertainment
      { name: 'Symphony Strings', category: 'entertainment', price: 240000, description: 'Live classical quartet', imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=800', features: ['Violin & Cello', 'Harpist', 'Grand Piano'] },
      { name: 'DJ Elite', category: 'entertainment', price: 120000, description: 'High-energy party vibes', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', features: ['EDM/House Mix', 'Light Show', 'Smoke Machine'] },
      { name: 'Star Performance Agency', category: 'entertainment', price: 1600000, description: 'A-list celebrity bookings', imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800', features: ['Pop Singer', 'Stand-up Comedy', 'Backup Dancers'] },
      
      // Photography
      { name: 'Lumiere Studios', category: 'photography', price: 320000, description: 'Cinematic storytelling', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', features: ['2 Photographers', 'Drone Shots', '4K Video Editing'] },
      { name: 'Candid Moments', category: 'photography', price: 144000, description: 'Documentary style coverage', imageUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800', features: ['Candid Specialists', 'Polaroid Prints', 'Digital Gallery'] },
      { name: 'Vogue Lens', category: 'photography', price: 680000, description: 'Editorial fashion-style photography', imageUrl: 'https://images.unsplash.com/photo-1533142266401-9231f2adbc4c?auto=format&fit=crop&q=80&w=800', features: ['Magazine Quality retouches', 'Stylist Included', 'Leather Bound Album'] }
    ];

    const updatedSeedData = seedData.map((v, i) => ({
      ...v,
      identifier: `seed_vendor_${i}@luxegather.com`,
      username: `SeedVendor${i}`,
      isVerified: true
    }));

    await Vendor.insertMany(updatedSeedData);
    res.json({ message: 'Vendors seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed vendors' });
  }
});

module.exports = router;
