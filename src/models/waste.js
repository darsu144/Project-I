const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // Assuming you store the photo URL as a string
    default: 'default_photo_url.jpg', // You can set a default photo if needed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Waste = mongoose.model('Waste', wasteSchema);

module.exports = Waste;
