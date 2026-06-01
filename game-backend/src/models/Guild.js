const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['leader', 'co-leader', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const guildSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  tag: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 5
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  icon: {
    type: String,
    default: 'default_guild'
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  exp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Guild', guildSchema);
