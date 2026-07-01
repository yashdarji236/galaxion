const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  craterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crater',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  cpr_used: {
    type: Number,
    required: true
  },
  dop_used: {
    type: Number,
    required: true
  },
  iceVolume_m3: {
    type: Number,
    required: true
  },
  confidence_interval: {
    type: Number,
    required: true
  },
  landingScore: {
    type: Number,
    required: true
  },
  terrainSafety: {
    slope: { type: Number, required: true },
    boulderDensity: { type: String, required: true },
    surfaceRoughness: { type: String, required: true },
    overallStatus: { type: String, required: true }
  },
  status: {
    type: String,
    default: 'completed'
  }
});

module.exports = mongoose.model('Report', ReportSchema);
