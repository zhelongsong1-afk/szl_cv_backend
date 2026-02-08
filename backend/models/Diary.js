const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'calm', 'tired', 'inspired'],
    default: 'calm'
  },
  weather: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for date-based queries
diarySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Diary', diarySchema);
