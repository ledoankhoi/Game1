const mongoose = require('mongoose');

const chatRuleSchema = new mongoose.Schema({
  keyword: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  response: { 
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true // Để bạn có thể bật/tắt luật này dễ dàng
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatRule', chatRuleSchema);