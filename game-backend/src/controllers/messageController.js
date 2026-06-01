const Message = require('../models/Message');
const Guild = require('../models/Guild');

const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ],
      guildId: null
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username avatarUrl')
      .lean();

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const getGuildMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { guildId } = req.params;

    const guild = await Guild.findById(guildId);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy guild' });
    }

    const isMember = guild.members.some(m => m.user.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Không phải thành viên' });
    }

    const messages = await Message.find({ guildId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username avatarUrl')
      .lean();

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

module.exports = { getConversation, getGuildMessages };
