const mongoose = require('mongoose');
const Vendor = require('./server/models/Vendor');

mongoose.connect('mongodb://127.0.0.1:27017/luxegather').then(async () => {
    const ferrari = new Vendor({
        identifier: "siddheshm717@gmail.com",
        username: "Siddhesh",
        isVerified: true,
        name: "Ferrari Catering",
        category: "catering",
        price: 10000,
        features: [],
        rating: 5,
        description: "WE GIVE FOOD"
    });
    // Ignore error if it already exists
    try { await ferrari.save(); console.log("Restored Ferrari Catering"); } catch(e) {}
    process.exit(0);
});
