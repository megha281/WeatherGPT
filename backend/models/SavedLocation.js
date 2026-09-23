const mongoose = require('mongoose');

const savedLocationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

savedLocationSchema.index({ user: 1, latitude: 1, longitude: 1 }, { unique: true });

module.exports = mongoose.model('SavedLocation', savedLocationSchema);
