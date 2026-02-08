const mongoose = require('mongoose');

const crawlerDataSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['ai', 'robotics', 'opensource', 'tech'],
    default: 'tech'
  },
  tags: [{
    type: String
  }],
  crawledAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search and date queries
crawlerDataSchema.index({ title: 'text', summary: 'text' });
crawlerDataSchema.index({ crawledAt: -1 });
crawlerDataSchema.index({ category: 1 });

module.exports = mongoose.model('CrawlerData', crawlerDataSchema);
