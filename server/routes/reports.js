const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');
const { mockReports, mockCraters } = require('../models/mockData');

// Protect routes
router.use(authMiddleware);

// GET /api/reports - Fetch all reports with crater details
router.get('/', async (req, res) => {
  // Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    return res.json(mockReports);
  }

  try {
    const reports = await Report.find({})
      .populate('craterId', 'name')
      .sort({ timestamp: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error retrieving saved reports' });
  }
});

// POST /api/reports/save - Save an analysis report
router.post('/save', async (req, res) => {
  const {
    craterId,
    cpr_used,
    dop_used,
    iceVolume_m3,
    confidence_interval,
    landingScore,
    terrainSafety
  } = req.body;

  if (!craterId || cpr_used === undefined || dop_used === undefined || iceVolume_m3 === undefined) {
    return res.status(400).json({ message: 'Missing required report parameters' });
  }

  // Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    const targetCrater = mockCraters.find(c => c._id === craterId);
    const newReport = {
      _id: 'offlineReport_' + Math.random().toString(36).substring(2, 9),
      craterId: {
        _id: craterId,
        name: targetCrater ? targetCrater.name : 'Target PSR-01'
      },
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      cpr_used: parseFloat(cpr_used),
      dop_used: parseFloat(dop_used),
      iceVolume_m3: parseInt(iceVolume_m3),
      confidence_interval: parseInt(confidence_interval || 0),
      landingScore: parseFloat(landingScore),
      terrainSafety: terrainSafety,
      status: 'completed'
    };
    mockReports.unshift(newReport);
    return res.status(201).json(newReport);
  }

  try {
    const report = new Report({
      craterId,
      userId: req.user.id,
      cpr_used,
      dop_used,
      iceVolume_m3,
      confidence_interval,
      landingScore,
      terrainSafety,
      status: 'completed'
    });

    const savedReport = await report.save();
    const populated = await Report.findById(savedReport._id).populate('craterId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Server error saving analysis report' });
  }
});

module.exports = router;
