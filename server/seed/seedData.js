const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Crater = require('../models/Crater');
const Report = require('../models/Report');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/galaxion';

async function seedDatabase() {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully.');

    // Clear existing collections
    await User.deleteMany({});
    await Crater.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('galaxion2026', salt);

    const user = new User({
      email: 'admin@galaxion.dev',
      passwordHash: passwordHash
    });

    await user.save();
    console.log('Seeded User: admin@galaxion.dev');

    // Helper to generate elevation profile
    const generateElevationProfile = (start, end, pointsCount = 20) => {
      const profile = [];
      const step = 2400 / (pointsCount - 1);
      for (let i = 0; i < pointsCount; i++) {
        const distance = Math.round(i * step);
        // Simulate a crater dip using a cosine wave or interpolation
        const ratio = i / (pointsCount - 1);
        // Dips down, stays down towards center
        const dipFactor = Math.sin(ratio * Math.PI * 0.5); 
        const elevation = Math.round(start + (end - start) * dipFactor);
        profile.push({ distance, elevation });
      }
      return profile;
    };

    // 2. Seed Crater 1: Faustini-PSR-07
    const faustiniElevation = generateElevationProfile(-2850, -3180, 20);
    const faustiniPath = [
      { lat: -87.15, lon: 64.90 }, // Landing Site
      { lat: -87.18, lon: 64.95 },
      { lat: -87.21, lon: 65.00 },
      { lat: -87.24, lon: 65.05 },
      { lat: -87.27, lon: 65.10 },
      { lat: -87.30, lon: 65.15 },
      { lat: -87.32, lon: 65.18 }  // Ice Zone Center
    ];

    const crater1 = new Crater({
      name: 'Faustini-PSR-07',
      lat: -87.32,
      lon: 65.18,
      area_km2: 77,
      description: 'A doubly shadowed PSR crater near the lunar south pole. Highly isolated thermal conditions make it a prime candidate for deep-subsurface ice accumulation.',
      iceZoneGeoJSON: {
        type: 'Feature',
        properties: {
          center: [-87.32, 65.18],
          radius_km: 8
        },
        geometry: {
          type: 'Point',
          coordinates: [65.18, -87.32] // GeoJSON is [lon, lat]
        }
      },
      landingSite: { lat: -87.15, lon: 64.90 },
      roverPath: faustiniPath,
      elevationProfile: faustiniElevation
    });

    await crater1.save();
    console.log('Seeded Crater: Faustini-PSR-07');

    // 3. Seed Crater 2: Shackleton-PSR-02
    const shackletonElevation = generateElevationProfile(-2600, -3400, 20);
    const shackletonPath = [
      { lat: -89.67, lon: 2.30 }, // Landing Site
      { lat: -89.71, lon: 1.90 },
      { lat: -89.75, lon: 1.50 },
      { lat: -89.79, lon: 1.10 },
      { lat: -89.83, lon: 0.70 },
      { lat: -89.87, lon: 0.30 },
      { lat: -89.90, lon: 0.00 }  // Ice Zone Center
    ];

    const crater2 = new Crater({
      name: 'Shackleton-PSR-02',
      lat: -89.90,
      lon: 0.00,
      area_km2: 120,
      description: 'Shackleton crater lies at the lunar South Pole. The peaks along its rim are exposed to almost continuous sunlight, while the interior is in permanent shadow.',
      iceZoneGeoJSON: {
        type: 'Feature',
        properties: {
          center: [-89.90, 0.00],
          radius_km: 12
        },
        geometry: {
          type: 'Point',
          coordinates: [0.00, -89.90] // GeoJSON is [lon, lat]
        }
      },
      landingSite: { lat: -89.67, lon: 2.30 },
      roverPath: shackletonPath,
      elevationProfile: shackletonElevation
    });

    await crater2.save();
    console.log('Seeded Crater: Shackleton-PSR-02');

    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
