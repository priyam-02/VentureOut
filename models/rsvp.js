const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['YES', 'NO', 'MAYBE'],
    required: true
  }
}, { timestamps: true });

const RSVP = mongoose.model('RSVP', rsvpSchema);

module.exports = RSVP;
