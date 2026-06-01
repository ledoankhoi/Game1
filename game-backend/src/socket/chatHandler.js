const Message = require('../models/Message');
const Friend = require('../models/Friend');
const Guild = require('../models/Guild');

const onlineUsers = new Map();

function chatHandler(io) {
  io.on('connection', async (socket) => {
    const userId = socket.data.user?.id;
    if (!userId) return;

    socket.join(`user:${userId}`);
    onlineUsers.set(userId, socket.id);

    const friendships = await Friend.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    });

    const friendIds = friendships.map(f =>
      f.requester.toString() === userId ? f.recipient.toString() : f.requester.toString()
    );

    friendIds.forEach(fid => {
      if (onlineUsers.has(fid)) {
        io.to(`user:${fid}`).emit('friend:online', { userId, username: socket.data.user.username });
      }
    });

    friendIds.forEach(fid => {
      if (onlineUsers.has(fid)) {
        socket.emit('friend:online', { userId: fid, username: '' });
      }
    });

    socket.on('chat:send-message', async (data) => {
      try {
        const { toUserId, content } = data;

        if (!toUserId || !content?.trim()) return;

        const friendship = await Friend.findOne({
          $or: [
            { requester: userId, recipient: toUserId, status: 'accepted' },
            { requester: toUserId, recipient: userId, status: 'accepted' }
          ]
        });

        if (!friendship) {
          socket.emit('chat:error', { message: 'Chỉ có thể nhắn tin với bạn bè' });
          return;
        }

        const message = await Message.create({
          sender: userId,
          receiver: toUserId,
          content: content.trim(),
          type: 'text'
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'username avatarUrl')
          .lean();

        io.to(`user:${toUserId}`).emit('chat:new-message', populated);
        socket.emit('chat:new-message', populated);
      } catch (err) {
        socket.emit('chat:error', { message: 'Lỗi gửi tin nhắn' });
      }
    });

    socket.on('chat:typing', (data) => {
      const { toUserId } = data;
      if (!toUserId) return;
      io.to(`user:${toUserId}`).emit('chat:typing-indicator', {
        fromUserId: userId,
        fromUsername: socket.data.user.username
      });
    });

    socket.on('chat:join-lobby', () => {
      socket.join('room:lobby');
    });

    socket.on('chat:leave-lobby', () => {
      socket.leave('room:lobby');
    });

    socket.on('chat:lobby-message', async (data) => {
      try {
        const { content } = data;
        if (!content?.trim()) return;

        const message = await Message.create({
          sender: userId,
          room: 'lobby',
          content: content.trim(),
          type: 'text'
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'username avatarUrl')
          .lean();

        io.to('room:lobby').emit('chat:lobby-new-message', populated);
      } catch (err) {
        socket.emit('chat:error', { message: 'Lỗi gửi tin nhắn' });
      }
    });

    socket.on('guild:join-room', async (guildId) => {
      if (!guildId) return;
      const guild = await Guild.findById(guildId);
      if (!guild) return;
      const isMember = guild.members.some(m => m.user.toString() === userId);
      if (!isMember) return;
      socket.join(`guild:${guildId}`);
    });

    socket.on('guild:chat-send', async (data) => {
      try {
        const { guildId, content } = data;

        if (!guildId || !content?.trim()) return;

        const guild = await Guild.findById(guildId);
        if (!guild) {
          socket.emit('chat:error', { message: 'Guild không tồn tại' });
          return;
        }

        const isMember = guild.members.some(m => m.user.toString() === userId);
        if (!isMember) {
          socket.emit('chat:error', { message: 'Không phải thành viên guild' });
          return;
        }

        const message = await Message.create({
          sender: userId,
          guildId,
          content: content.trim(),
          type: 'text'
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'username avatarUrl')
          .lean();

        socket.join(`guild:${guildId}`);
        io.to(`guild:${guildId}`).emit('guild:chat-message', populated);
      } catch (err) {
        socket.emit('chat:error', { message: 'Lỗi gửi tin nhắn guild' });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);

      friendIds.forEach(fid => {
        io.to(`user:${fid}`).emit('friend:offline', { userId });
      });
    });
  });
}

module.exports = chatHandler;
