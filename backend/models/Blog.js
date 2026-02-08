const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'general'
  },
  coverImage: {
    type: String,
    default: ''
  },
  published: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
blogSchema.index({ title: 'text', content: 'text', summary: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
