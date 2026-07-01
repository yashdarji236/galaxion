const mongoose = require('mongoose');

const CraterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  lat: {
    type: Number,
    required: true
  },
  lon: {
    type: Number,
    required: true
  },
  area_km2: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  iceZoneGeoJSON: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  landingSite: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  roverPath: [
    {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    }
  ],
  elevationProfile: [
    {
      distance: { type: Number, required: true },
      elevation: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Crater', CraterSchema);
