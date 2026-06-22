const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/leads
// @desc    Create a new lead. PUBLIC - called by the website contact form.
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, source } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const lead = await Lead.create({ name, email, phone, message, source });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// All routes below require admin authentication
router.use(protect);

// @route   GET /api/leads
// @desc    Get all leads with optional filtering, search and pagination
//          Query params: status, source, search, page, limit
router.get('/', async (req, res) => {
  try {
    const { status, source, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Lead.countDocuments(filter)
    ]);

    res.json({
      leads,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/leads/:id
// @desc    Get a single lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update lead details (name, email, phone, message, source)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, message, source } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (message !== undefined) lead.message = message;
    if (source !== undefined) lead.source = source;

    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PATCH /api/leads/:id/status
// @desc    Update lead status (new / contacted / converted / lost)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'converted', 'lost'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/leads/:id/notes
// @desc    Add a note / follow-up to a lead
router.post('/:id/notes', async (req, res) => {
  try {
    const { text, followUpDate, createdBy } = req.body;

    if (!text) return res.status(400).json({ message: 'Note text is required' });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes.push({ text, followUpDate, createdBy: createdBy || req.admin.email });
    await lead.save();

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/leads/:id/notes/:noteId
// @desc    Remove a note from a lead
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes = lead.notes.filter((n) => n._id.toString() !== req.params.noteId);
    await lead.save();

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
