const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Nếu user chưa đăng nhập thì để null (khách)
  },
  userMessage: {
    type: String,
    required: true
  },
  aiReply: {
    type: String,
    required: true
  },
  isEasterEgg: {
    type: Boolean,
    default: false // Đánh dấu xem câu này là do AI trả lời hay trúng luật bí mật
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);