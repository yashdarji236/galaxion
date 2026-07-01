const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Crater = require('../models/Crater');
const authMiddleware = require('../middleware/authMiddleware');
const { mockCraters } = require('../models/mockData');

// Protect all routes
router.use(authMiddleware);

// GET /api/craters - Get all craters
router.get('/', async (req, res) => {
  // Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    const list = mockCraters.map(({ _id, name, lat, lon, area_km2, description }) => ({
      _id,
      name,
      lat,
      lon,
      area_km2,
      description
    }));
    return res.json(list);
  }

  try {
    const craters = await Crater.find({}, 'name lat lon area_km2 description');
    res.json(craters);
  } catch (error) {
    console.error('Error fetching craters:', error);
    res.status(500).json({ message: 'Server error retrieving craters' });
  }
});

// GET /api/craters/:id - Get single crater with full data
router.get('/:id', async (req, res) => {
  // Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    const crater = mockCraters.find(c => c._id === req.params.id);
    if (!crater) {
      return res.status(404).json({ message: 'Crater not found (offline)' });
    }
    return res.json(crater);
  }

  try {
    const crater = await Crater.findById(req.params.id);
    if (!crater) {
      return res.status(404).json({ message: 'Crater not found' });
    }
    res.json(crater);
  } catch (error) {
    console.error('Error fetching crater detail:', error);
    res.status(500).json({ message: 'Server error retrieving crater details' });
  }
});

module.exports = router;
