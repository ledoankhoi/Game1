---
title: Social Features Implementation (Friends, Chat, Guilds, Profile)
date: 2026-06-01
category: architecture-patterns
module: social-features
problem_type: architecture_pattern
component: tooling
severity: medium
applies_when:
  - Adding real-time social features to a turn-based game platform
  - Integrating REST API with Socket.IO for auth-gated chat
  - Implementing multi-feature module (friends, guilds, chat, profiles)
tags: [socket-io, real-time-chat, friends-system, guild-system, public-profile, express, react, mongoose]
---

# Social Features Implementation

## Context

MathQuest was a single-player math game platform lacking social connectivity. Four interconnected features were needed: friends system, real-time chat, guilds/clans, and public profiles. The existing codebase had Socket.IO for game handlers (chess, othello) but no auth middleware on socket connections, no social models, and no chat infrastructure.

## Guidance

### Architecture Pattern: REST + WebSocket Dual Layer

Use REST for CRUD operations (friend requests, guild management, profile data) and Socket.IO for real-time events (messaging, typing indicators, online status). This separation keeps the API stateless while enabling live features.

### Socket Auth Middleware First

Before adding any social socket events, add JWT authentication to the Socket.IO connection. Without this, any client can impersonate any user:

```js
// game-backend/src/middlewares/socketAuth.js
function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
}

// Register in app.js BEFORE any handlers
io.use(socketAuth);
```

### Personal Rooms Pattern

For 1-1 messaging, each user joins a personal room `user:<userId>` on connection. This enables targeted message delivery without tracking socket IDs:

```js
socket.on('connection', (socket) => {
  socket.join(`user:${userId}`);
  // Send to specific user:
  io.to(`user:${recipientId}`).emit('chat:new-message', message);
});
```

### Single Owner of Friendship Gate

Chat permission (who can message whom) is checked in ONE place: the socket `chat:send-message` handler. Both the REST API and socket handler query the same `Friend` model with status `accepted`. This avoids drift between layers.

### File Organization per Feature

Each social feature gets its own file cluster:

```
game-backend/src/
  models/Friend.js, Guild.js, Message.js
  controllers/friendController.js, guildController.js, messageController.js, profileController.js
  routes/friendRoutes.js, guildRoutes.js, messageRoutes.js, profileRoutes.js
  socket/chatHandler.js

game-frontend/src/
  services/socket.js
  store/useFriendStore.js, useChatStore.js, useGuildStore.js
  pages/Social.jsx, Guild.jsx, PublicProfile.jsx
  components/FriendList.jsx, ChatWindow.jsx, GuildCreateModal.jsx, GuildMemberList.jsx
```

### Frontend Socket Client Singleton

Create a single shared socket connection module that all stores import. Initialize on first use with the JWT token:

```js
// game-frontend/src/services/socket.js
let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;
  const token = localStorage.getItem('token');
  if (!token) return null;
  socket = io('/', { auth: { token } });
  return socket;
}
```

### Zustand Store + Socket Listener Pattern

Each social store initializes socket listeners in an `initSocket` action called from the page's `useEffect`. This decouples socket lifecycle from component mounting:

```js
const useFriendStore = create((set, get) => ({
  friends: [],
  onlineUsers: new Set(),

  initSocket: () => {
    const socket = connectSocket();
    socket.on('friend:online', ({ userId }) => {
      set((s) => { const next = new Set(s.onlineUsers); next.add(userId); return { onlineUsers: next }; });
    });
  },
  // ...
}));
```

## Why This Matters

Without these patterns, adding social features to an existing game platform leads to:
- **Security holes**: socket connections without auth allow impersonation
- **Duplicate permission logic**: friendship checks scattered across REST and socket handlers
- **Connection leaks**: multiple socket connections per page (one per store)
- **Untestable code**: socket event handlers mixed into component logic

## When to Apply

- Starting any real-time feature on an existing Express + Socket.IO backend
- Adding auth-gated socket events to an existing unauthenticated socket setup
- Building multi-feature social systems where features share auth and permission models
- Using Zustand for state management with Socket.IO event integration

## Examples

### Socket Event Flow: Friend Online Detection

```
User A connects → socket joins user:A room → queries Friend model for A's friends
  → for each online friend B, emit friend:online to A's room
  → emit friend:online to each online friend's room about A

User A disconnects → emit friend:offline to all online friends' rooms
```

### REST Endpoint Pattern for CRUD

```js
// friendRoutes.js
router.get('/list', authMiddleware, friendController.getList);
router.post('/request', authMiddleware, friendController.sendRequest);
router.post('/accept', authMiddleware, friendController.acceptRequest);
```

### Chat Permission Gate (single source of truth)

```js
// chatHandler.js - the ONLY place friendship is checked for chat
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
```

## Related

- Plan: `docs/plans/2026-06-01-001-feat-social-features-plan.md`
- Requirements: `docs/brainstorms/social-features-requirements.md`
