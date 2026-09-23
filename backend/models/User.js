const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SUPPORTED_LANGUAGES = ['en', 'hi', 'kn', 'ta', 'te'];

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false, default: null },
    emailVerificationExpires: { type: Date, select: false, default: null },
    preferredLanguage: { type: String, enum: SUPPORTED_LANGUAGES, default: 'en' },
    defaultLocation: { type: locationSchema, default: () => ({}) },
    preferences: {
      temperatureUnit: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' },
      windUnit: { type: String, enum: ['kmh', 'ms', 'mph'], default: 'kmh' },
      notifications: {
        email: { type: Boolean, default: false },
        severeWeatherOnly: { type: Boolean, default: true },
      },
      alertMinimumSeverity: {
        type: String,
        enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE'],
        default: 'MODERATE',
      },
    },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    isEmailVerified: this.isEmailVerified,
    preferredLanguage: this.preferredLanguage,
    defaultLocation: this.defaultLocation || null,
    preferences: this.preferences,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

module.exports = mongoose.model('User', userSchema);
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
