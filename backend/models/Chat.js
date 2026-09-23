const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    structured: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New conversation', maxlength: 120 },
    messages: { type: [messageSchema], default: [] },
    location: {
      name: String,
      city: String,
      state: String,
      country: String,
      latitude: Number,
      longitude: Number,
    },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
