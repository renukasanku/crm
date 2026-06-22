const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdBy: { type: String, default: 'Admin' },
    followUpDate: { type: Date }
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    message: { type: String, trim: true },
    source: {
      type: String,
      enum: ['website', 'landing_page', 'referral', 'social_media', 'other'],
      default: 'website'
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'lost'],
      default: 'new'
    },
    notes: [noteSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
