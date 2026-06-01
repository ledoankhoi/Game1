const Guild = require('../models/Guild');
const User = require('../models/User');

const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, tag, description, icon } = req.body;

    if (!name || !tag) {
      return res.status(400).json({ success: false, message: 'Thiếu tên hoặc tag' });
    }

    const existingGuild = await Guild.findOne({
      $or: [{ name }, { tag: tag.toUpperCase() }]
    });

    if (existingGuild) {
      return res.status(400).json({ success: false, message: 'Tên hoặc tag đã tồn tại' });
    }

    const guild = await Guild.create({
      name,
      tag: tag.toUpperCase(),
      description: description || '',
      icon: icon || 'default_guild',
      leader: userId,
      members: [{ user: userId, role: 'leader' }]
    });

    res.json({ success: true, message: 'Đã tạo guild', guild });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const getMyGuild = async (req, res) => {
  try {
    const userId = req.user.id;
    const guild = await Guild.findOne({ 'members.user': userId })
      .populate('members.user', 'username avatarUrl level coins')
      .populate('leader', 'username avatarUrl');

    if (!guild) {
      return res.json({ success: true, guild: null });
    }

    res.json({ success: true, guild });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const getGuild = async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id)
      .populate('members.user', 'username avatarUrl level coins')
      .populate('leader', 'username avatarUrl');

    if (!guild) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy guild' });
    }

    res.json({ success: true, guild });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const join = async (req, res) => {
  try {
    const userId = req.user.id;
    const guild = await Guild.findById(req.params.id);

    if (!guild) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy guild' });
    }

    const isMember = guild.members.some(m => m.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Đã là thành viên' });
    }

    guild.members.push({ user: userId, role: 'member' });
    await guild.save();

    res.json({ success: true, message: 'Đã tham gia guild', guild });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const leave = async (req, res) => {
  try {
    const userId = req.user.id;
    const guild = await Guild.findById(req.params.id);

    if (!guild) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy guild' });
    }

    const memberIdx = guild.members.findIndex(m => m.user.toString() === userId);
    if (memberIdx === -1) {
      return res.status(400).json({ success: false, message: 'Không phải thành viên' });
    }

    if (guild.members[memberIdx].role === 'leader') {
      return res.status(400).json({ success: false, message: 'Leader không thể rời guild. Hãy chuyển quyền trước' });
    }

    guild.members.splice(memberIdx, 1);
    await guild.save();

    res.json({ success: true, message: 'Đã rời guild' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const kick = async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.body;

    const guild = await Guild.findById(req.params.id);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy guild' });
    }

    const myMember = guild.members.find(m => m.user.toString() === userId);
    if (!myMember || (myMember.role !== 'leader' && myMember.role !== 'co-leader')) {
      return res.status(403).json({ success: false, message: 'Không có quyền' });
    }

    const targetIdx = guild.members.findIndex(m => m.user.toString() === memberId);
    if (targetIdx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thành viên' });
    }

    if (guild.members[targetIdx].role === 'leader') {
      return res.status(400).json({ success: false, message: 'Không thể kick leader' });
    }

    guild.members.splice(targetIdx, 1);
    await guild.save();

    res.json({ success: true, message: 'Đã kick thành viên' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const promote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberId, role } = req.body;

    const guild = await Guild.findById(req.params.id);
    if (!guild) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy guild' });
    }

    const myMember = guild.members.find(m => m.user.toString() === userId);
    if (!myMember || myMember.role !== 'leader') {
      return res.status(403).json({ success: false, message: 'Chỉ leader mới có quyền' });
    }

    const target = guild.members.find(m => m.user.toString() === memberId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thành viên' });
    }

    if (role === 'leader') {
      myMember.role = 'member';
      target.role = 'leader';
      guild.leader = target.user;
    } else if (role === 'co-leader') {
      target.role = 'co-leader';
    } else {
      target.role = 'member';
    }

    await guild.save();
    res.json({ success: true, message: 'Đã thay đổi quyền', guild });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const leaderboard = async (req, res) => {
  try {
    const guilds = await Guild.find()
      .sort({ exp: -1 })
      .limit(50)
      .select('name tag icon exp level')
      .lean();

    res.json({ success: true, guilds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

module.exports = { create, getMyGuild, getGuild, join, leave, kick, promote, leaderboard };
