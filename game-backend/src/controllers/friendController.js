const Friend = require('../models/Friend');
const User = require('../models/User');

const getList = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendships = await Friend.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'username avatarUrl level coins');

    const friends = friendships.map(f => {
      const friend = f.requester._id.toString() === userId ? f.recipient : f.requester;
      return {
        _id: friend._id,
        username: friend.username,
        avatarUrl: friend.avatarUrl,
        level: friend.level,
        coins: friend.coins
      };
    });

    res.json({ success: true, friends });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const getRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await Friend.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'username avatarUrl level');

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const sendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Thiếu tên người dùng' });
    }

    const target = await User.findOne({ username });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    if (target._id.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Không thể kết bạn với chính mình' });
    }

    const existing = await Friend.findOne({
      $or: [
        { requester: userId, recipient: target._id },
        { requester: target._id, recipient: userId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Đã là bạn bè' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Đã gửi lời mời trước đó' });
      }
    }

    const friend = await Friend.create({
      requester: userId,
      recipient: target._id,
      status: 'pending'
    });

    const populated = await Friend.findById(friend._id)
      .populate('requester', 'username avatarUrl level');

    res.json({ success: true, message: 'Đã gửi lời mời kết bạn', request: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.body;

    const friend = await Friend.findOne({ _id: requestId, recipient: userId, status: 'pending' });
    if (!friend) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời mời' });
    }

    friend.status = 'accepted';
    await friend.save();

    const populated = await Friend.findById(friend._id)
      .populate('requester', 'username avatarUrl level coins');

    res.json({ success: true, message: 'Đã chấp nhận lời mời', friend: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.body;

    const friend = await Friend.findOneAndDelete({ _id: requestId, recipient: userId, status: 'pending' });
    if (!friend) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời mời' });
    }

    res.json({ success: true, message: 'Đã từ chối lời mời' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    const result = await Friend.findOneAndDelete({
      $or: [
        { requester: userId, recipient: friendId, status: 'accepted' },
        { requester: friendId, recipient: userId, status: 'accepted' }
      ]
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bạn bè' });
    }

    res.json({ success: true, message: 'Đã xóa bạn' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

module.exports = { getList, getRequests, sendRequest, acceptRequest, rejectRequest, removeFriend };
