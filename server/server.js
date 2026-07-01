const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Crater = require('./models/Crater');

const authRoutes = require('./routes/auth');
const craterRoutes = require('./routes/craters');
const analysisRoutes = require('./routes/analysis');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/galaxion';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/craters', craterRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: mongoose.connection.readyState === 1 ? 'production' : 'offline-mock',
    message: 'Galaxion API Server is operational.'
  });
});

// Auto seeding function on startup
async function autoSeed() {
  try {
    const userCount = await User.countDocuments();
    const craterCount = await Crater.countDocuments();

    if (userCount === 0 || craterCount === 0) {
      console.log('Database empty, triggering auto-seeding...');
      const bcrypt = require('bcryptjs');
      
      // Seed default user
      await User.deleteMany({});
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('galaxion2026', salt);
      const user = new User({
        email: 'admin@galaxion.dev',
        passwordHash
      });
      await user.save();
      console.log('Auto-seeded default user admin@galaxion.dev / galaxion2026');

      // Seed craters
      await Crater.deleteMany({});
      
      const generateElevationProfile = (start, end, pointsCount = 20) => {
        const profile = [];
        const step = 2400 / (pointsCount - 1);
        for (let i = 0; i < pointsCount; i++) {
          const distance = Math.round(i * step);
          const ratio = i / (pointsCount - 1);
          const dipFactor = Math.sin(ratio * Math.PI * 0.5); 
          const elevation = Math.round(start + (end - start) * dipFactor);
          profile.push({ distance, elevation });
        }
        return profile;
      };

      const faustiniElevation = generateElevationProfile(-2850, -3180, 20);
      const faustiniPath = [
        { lat: -87.15, lon: 64.90 },
        { lat: -87.18, lon: 64.95 },
        { lat: -87.21, lon: 65.00 },
        { lat: -87.24, lon: 65.05 },
        { lat: -87.27, lon: 65.10 },
        { lat: -87.30, lon: 65.15 },
        { lat: -87.32, lon: 65.18 }
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
            coordinates: [65.18, -87.32]
          }
        },
        landingSite: { lat: -87.15, lon: 64.90 },
        roverPath: faustiniPath,
        elevationProfile: faustiniElevation
      });
      await crater1.save();

      const shackletonElevation = generateElevationProfile(-2600, -3400, 20);
      const shackletonPath = [
        { lat: -89.67, lon: 2.30 },
        { lat: -89.71, lon: 1.90 },
        { lat: -89.75, lon: 1.50 },
        { lat: -89.79, lon: 1.10 },
        { lat: -89.83, lon: 0.70 },
        { lat: -89.87, lon: 0.30 },
        { lat: -89.90, lon: 0.00 }
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
            coordinates: [0.00, -89.90]
          }
        },
        landingSite: { lat: -89.67, lon: 2.30 },
        roverPath: shackletonPath,
        elevationProfile: shackletonElevation
      });
      await crater2.save();
      
      console.log('Auto-seeded craters successfully.');
    }
  } catch (error) {
    console.error('Error during auto-seeding:', error);
  }
}

// Connect to MongoDB
console.log('Connecting to MongoDB at:', MONGODB_URI);
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    await autoSeed();
    app.listen(PORT, () => {
      console.log(`Server running in PRODUCTION mode on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    console.log('WARNING: MongoDB is not running. Starting API server in Offline Mock Mode...');
    app.listen(PORT, () => {
      console.log(`Server running in OFFLINE MOCK MODE on port ${PORT}`);
    });
  });
