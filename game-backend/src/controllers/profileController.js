const User = require('../models/User');
const Guild = require('../models/Guild');
const Friend = require('../models/Friend');

const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('username avatarUrl level exp coins totalScore unlockedAchievements favoriteGames createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const friendCount = await Friend.countDocuments({
      $or: [{ requester: user._id }, { recipient: user._id }],
      status: 'accepted'
    });

    const guild = await Guild.findOne({ 'members.user': user._id })
      .select('name tag icon')
      .lean();

    res.json({
      success: true,
      profile: {
        ...user,
        friendCount,
        guild: guild || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

module.exports = { getPublicProfile };
