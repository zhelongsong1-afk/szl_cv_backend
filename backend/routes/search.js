const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Diary = require('../models/Diary');
const CrawlerData = require('../models/CrawlerData');

// Global search across all collections
router.get('/', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchRegex = new RegExp(q, 'i');
    const results = {
      blogs: [],
      diaries: [],
      crawlerData: []
    };
    
    // Search blogs
    if (!type || type === 'blog') {
      results.blogs = await Blog.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { summary: searchRegex },
          { tags: searchRegex }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limit);
    }
    
    // Search diaries
    if (!type || type === 'diary') {
      results.diaries = await Diary.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limit);
    }
    
    // Search crawler data
    if (!type || type === 'crawler') {
      results.crawlerData = await CrawlerData.find({
        $or: [
          { title: searchRegex },
          { summary: searchRegex },
          { tags: searchRegex }
        ]
      })
        .sort({ crawledAt: -1 })
        .limit(limit);
    }
    
    const total = results.blogs.length + results.diaries.length + results.crawlerData.length;
    
    res.json({
      query: q,
      total,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced search with filters
router.post('/advanced', async (req, res) => {
  try {
    const { q, filters = {}, dateRange, sortBy = 'relevance' } = req.body;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchRegex = new RegExp(q, 'i');
    const results = [];
    
    // Build date filter
    const dateFilter = {};
    if (dateRange) {
      if (dateRange.start) dateFilter.$gte = new Date(dateRange.start);
      if (dateRange.end) dateFilter.$lte = new Date(dateRange.end);
    }
    
    // Search blogs
    if (!filters.type || filters.type.includes('blog')) {
      const blogQuery = {
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { summary: searchRegex }
        ]
      };
      if (filters.category) blogQuery.category = filters.category;
      if (Object.keys(dateFilter).length > 0) blogQuery.createdAt = dateFilter;
      
      const blogs = await Blog.find(blogQuery).limit(20);
      results.push(...blogs.map(b => ({ ...b.toObject(), type: 'blog' })));
    }
    
    // Search diaries
    if (!filters.type || filters.type.includes('diary')) {
      const diaryQuery = {
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      };
      if (filters.mood) diaryQuery.mood = filters.mood;
      if (Object.keys(dateFilter).length > 0) diaryQuery.createdAt = dateFilter;
      
      const diaries = await Diary.find(diaryQuery).limit(20);
      results.push(...diaries.map(d => ({ ...d.toObject(), type: 'diary' })));
    }
    
    // Search crawler data
    if (!filters.type || filters.type.includes('crawler')) {
      const crawlerQuery = {
        $or: [
          { title: searchRegex },
          { summary: searchRegex }
        ]
      };
      if (filters.category) crawlerQuery.category = filters.category;
      if (Object.keys(dateFilter).length > 0) crawlerQuery.crawledAt = dateFilter;
      
      const crawlerData = await CrawlerData.find(crawlerQuery).limit(20);
      results.push(...crawlerData.map(c => ({ ...c.toObject(), type: 'crawler' })));
    }
    
    // Sort results
    if (sortBy === 'date') {
      results.sort((a, b) => {
        const dateA = a.createdAt || a.crawledAt;
        const dateB = b.createdAt || b.crawledAt;
        return new Date(dateB) - new Date(dateA);
      });
    }
    
    res.json({
      query: q,
      total: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
