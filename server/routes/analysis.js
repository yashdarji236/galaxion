const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Crater = require('../models/Crater');
const authMiddleware = require('../middleware/authMiddleware');
const { mockCraters } = require('../models/mockData');

// Protect route
router.use(authMiddleware);

// POST /api/analysis/run
router.post('/run', async (req, res) => {
  const { craterId, cpr_threshold, dop_threshold, w1, w2, w3 } = req.body;

  if (!craterId) {
    return res.status(400).json({ message: 'Crater ID is required' });
  }

  // Parse inputs (with fallbacks)
  const cpr = parseFloat(cpr_threshold) || 1.34;
  const dop = parseFloat(dop_threshold) || 0.09;
  const weight1 = w1 !== undefined ? parseFloat(w1) : 0.4;
  const weight2 = w2 !== undefined ? parseFloat(w2) : 0.4;
  const weight3 = w3 !== undefined ? parseFloat(w3) : 0.2;

  try {
    let crater = null;

    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      crater = mockCraters.find(c => c._id === craterId);
    } else {
      crater = await Crater.findById(craterId);
    }

    if (!crater) {
      return res.status(404).json({ message: 'Crater not found' });
    }

    // Simulate 2-second processing delay
    setTimeout(() => {
      // Calculate dynamic factors based on thresholds
      // Base CPR default is 1.34, DOP is 0.09
      // High CPR threshold = less area classified as ice (smaller radius & volume)
      const cprFactor = Math.max(0.3, Math.min(2.0, 1 + (1.34 - cpr) * 0.9));
      
      // High DOP threshold = more scattering allowed (larger area & volume)
      const dopFactor = Math.max(0.3, Math.min(2.0, 1 + (dop - 0.09) * 2.2));

      // Base volumes
      const isFaustini = crater.name.includes('Faustini');
      const baseVolume = isFaustini ? 2400000 : 4100000;
      const confidenceMarginBase = isFaustini ? 300000 : 600000;

      const iceVolume = Math.round(baseVolume * cprFactor * dopFactor);
      const confidence_interval = Math.round(confidenceMarginBase * (cprFactor * 0.7 + dopFactor * 0.3));

      // Calculate confidence percent for progress bar
      const cprDist = Math.abs(cpr - 1.34);
      const dopDist = Math.abs(dop - 0.09);
      const confidence_percent = Math.max(50, Math.min(99, Math.round(90 - cprDist * 20 - dopDist * 50)));

      // Dynamic Radii for Leaflet Circles (in km)
      const baseRadius = isFaustini ? 8 : 12;
      const currentRadius = baseRadius * cprFactor * dopFactor;

      const iceZones = {
        center: [crater.lat, crater.lon],
        highRadius: currentRadius * 0.4,
        mediumRadius: currentRadius * 0.7,
        lowRadius: currentRadius * 1.1,
        cpr: cpr,
        dop: dop,
        confidenceText: confidence_percent > 85 ? 'High' : confidence_percent > 70 ? 'Moderate' : 'Low'
      };

      // Terrain safety configurations (with small deterministic adjustments to feel live)
      const terrainSafety = isFaustini 
        ? {
            slope: parseFloat((6.2 + (cpr - 1.34) * 0.5).toFixed(1)),
            boulderDensity: dop > 0.15 ? 'Moderate' : 'Low',
            surfaceRoughness: cpr > 1.5 ? 'High' : (cpr > 1.0 ? 'Moderate' : 'Low'),
            overallStatus: 'SAFE FOR LANDING'
          }
        : {
            slope: parseFloat((11.4 + (cpr - 1.34) * 0.8).toFixed(1)),
            boulderDensity: dop > 0.20 ? 'High' : (dop > 0.10 ? 'Moderate' : 'Low'),
            surfaceRoughness: cpr > 1.6 ? 'High' : (cpr > 1.1 ? 'Moderate' : 'Low'),
            overallStatus: (11.4 + (cpr - 1.34) * 0.8) > 15.0 ? 'WARNING: UNSAFE SLOPE' : 'SAFE FOR LANDING'
          };

      // Landing score formulas
      const baseIceScore = isFaustini ? 0.85 : 0.92;
      const baseSlopeScore = isFaustini ? 0.90 : 0.75;
      const baseSolarScore = isFaustini ? 0.70 : 0.95;

      // Adjust based on thresholds
      const iceScore = Math.max(0.1, Math.min(1.0, baseIceScore * cprFactor * dopFactor));
      const slopeScore = terrainSafety.slope < 15.0 ? baseSlopeScore : baseSlopeScore * 0.5;
      const solarScore = baseSolarScore;

      const score = parseFloat((weight1 * iceScore + weight2 * slopeScore + weight3 * solarScore).toFixed(2));

      res.json({
        iceZones,
        landingSite: crater.landingSite,
        roverPath: crater.roverPath,
        elevationProfile: crater.elevationProfile,
        iceVolume,
        confidence_interval,
        confidence_percent,
        terrainSafety,
        score
      });
    }, 2000);
  } catch (error) {
    console.error('Error running radar analysis:', error);
    res.status(500).json({ message: 'Server error during radar analysis run' });
  }
});

module.exports = router;
