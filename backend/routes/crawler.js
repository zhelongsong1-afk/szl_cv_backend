const express = require('express');
const router = express.Router();
const CrawlerData = require('../models/CrawlerData');

// GET all crawler data
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isRead, isFavorite } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isFavorite !== undefined) query.isFavorite = isFavorite === 'true';
    
    const data = await CrawlerData.find(query)
      .sort({ crawledAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await CrawlerData.countDocuments(query);
    
    res.json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET latest 10 items (for daily digest)
router.get('/latest', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const data = await CrawlerData.find({
      crawledAt: { $gte: today }
    })
      .sort({ crawledAt: -1 })
      .limit(10);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await CrawlerData.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE crawler data (for crawler script)
router.post('/', async (req, res) => {
  try {
    // Check if URL already exists
    const existing = await CrawlerData.findOne({ url: req.body.url });
    if (existing) {
      return res.status(409).json({ error: 'URL already exists', item: existing });
    }
    
    const item = new CrawlerData(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// BATCH create crawler data
router.post('/batch', async (req, res) => {
  try {
    const items = req.body.items || [];
    const results = [];
    const duplicates = [];
    
    for (const itemData of items) {
      const existing = await CrawlerData.findOne({ url: itemData.url });
      if (existing) {
        duplicates.push(itemData.url);
      } else {
        const item = new CrawlerData(itemData);
        await item.save();
        results.push(item);
      }
    }
    
    res.status(201).json({
      created: results.length,
      duplicates: duplicates.length,
      items: results
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE item (mark as read/favorite)
router.put('/:id', async (req, res) => {
  try {
    const item = await CrawlerData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    const item = await CrawlerData.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
