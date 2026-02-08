const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

// GET all diaries
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, mood } = req.query;
    const query = {};
    
    if (mood) query.mood = mood;
    
    const diaries = await Diary.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Diary.countDocuments(query);
    
    res.json({
      diaries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET diary by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const diaries = await Diary.find(query).sort({ createdAt: -1 });
    res.json(diaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single diary
router.get('/:id', async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) {
      return res.status(404).json({ error: 'Diary not found' });
    }
    res.json(diary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE diary
router.post('/', async (req, res) => {
  try {
    const diary = new Diary(req.body);
    await diary.save();
    res.status(201).json(diary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE diary
router.put('/:id', async (req, res) => {
  try {
    const diary = await Diary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!diary) {
      return res.status(404).json({ error: 'Diary not found' });
    }
    res.json(diary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE diary
router.delete('/:id', async (req, res) => {
  try {
    const diary = await Diary.findByIdAndDelete(req.params.id);
    if (!diary) {
      return res.status(404).json({ error: 'Diary not found' });
    }
    res.json({ message: 'Diary deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
