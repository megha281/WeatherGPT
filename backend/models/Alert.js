const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    location: {
      name: String,
      city: String,
      state: String,
      country: String,
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    type: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE'],
      default: 'MODERATE',
    },
    description: { type: String, default: '' },
    advisory: { type: String, default: '' },
    // "official" = issued by a weather authority, "weathergpt" = our deterministic engine
    sourceType: { type: String, enum: ['official', 'weathergpt'], default: 'weathergpt' },
    source: { type: String, default: 'WeatherGPT Risk Assessment' },
    sourceUrl: { type: String, default: '' },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

alertSchema.index({ 'location.latitude': 1, 'location.longitude': 1, validUntil: 1 });

module.exports = mongoose.model('Alert', alertSchema);
