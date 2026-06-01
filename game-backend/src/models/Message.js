const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guildId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild',
    default: null
  },
  room: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  }
}, { timestamps: true });

messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ guildId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
