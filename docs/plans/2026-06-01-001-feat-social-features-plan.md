# Plan: Social Features (Friends, Chat, Guilds, Public Profile)

- **Type:** feat
- **Created:** 2026-06-01
- **Status:** active
- **Origin:** `docs/brainstorms/social-features-requirements.md`

## Problem Frame

MathQuest currently lacks social connectivity. Players cannot friend each other, chat in real-time, form guilds, or view public profiles. Adding these 4 interconnected features transforms MathQuest from a single-player experience into a community platform.

## Scope Boundaries

### In Scope
- Friend system: send/accept/reject/remove friend requests, list friends with online status
- Real-time chat: 1-1 friend chat, global lobby chat, guild chat via Socket.IO
- Guild/Clan system: create guild, join/leave, guild chat, guild leaderboard
- Public profile page: `/profile/:username` showing avatar, stats, friends, achievements
- Socket.IO authentication middleware for secure connections
- Friendship determines chat access (only friends can 1-1 chat)

### Deferred for Later
- Guild wars / competitions
- Friend feed / activity timeline
- Advanced moderation tools (mute/ban from chat)
- Message reactions, image/file sharing in chat

### Outside This Plan's Identity
- Voice/video chat
- Matchmaking system
- Player marketplace

## System-Wide Impact

| Area | Impact |
|------|--------|
| **Backend models** | 3 new models: Friend, Guild, Message. ChatHistory extended for social chat |
| **Backend socket** | New auth middleware for socket connections. New handler: chatHandler (covers 1-1, lobby, guild) |
| **Backend routes** | New route files: friendRoutes, guildRoutes, profileRoutes |
| **Frontend stores** | 3 new Zustand stores: useFriendStore, useChatStore, useGuildStore |
| **Frontend pages** | 2 new pages: SocialPage (friends + chat), PublicProfilePage. GuildPage |
| **Frontend components** | FriendList, ChatWindow, GuildCard, GuildCreateModal |
| **Navigation** | Header gets Social link, Profile gets public URL |
| **Socket client** | New shared socket connection module in frontend |

## High-Level Technical Design

### Architecture Overview

```
Frontend (React)                    Backend (Express + Socket.IO)
┌─────────────────────┐            ┌──────────────────────────┐
│  useFriendStore     │── REST ──▶ │  /api/friends/*          │
│  useGuildStore      │── REST ──▶ │  /api/guilds/*           │
│  useChatStore       │── REST ──▶ │  /api/messages/*         │
│                     │            │  /api/profile/:username  │
│  SocketContext      │── WS ────▶ │  chatHandler (socket.io) │
│  (socket.io client) │            │  - friend:online/offline │
│                     │            │  - chat:send-message     │
│                     │            │  - chat:typing           │
│                     │            │  - guild:chat            │
└─────────────────────┘            └──────────────────────────┘
```

### Socket Event Map

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `friend:online` | Server→Client | `{ userId, username }` | Friend came online |
| `friend:offline` | Server→Client | `{ userId }` | Friend went offline |
| `friend:request-received` | Server→Client | `{ fromUserId, fromUsername }` | New friend request |
| `friend:accepted` | Server→Client | `{ byUserId, byUsername }` | Request accepted |
| `chat:send-message` | Client→Server | `{ toUserId?, room?, content }` | Send message (1-1 or room) |
| `chat:new-message` | Server→Client | `{ from, content, timestamp, room? }` | Receive message |
| `chat:typing` | Client→Server | `{ toUserId?, room? }` | User is typing |
| `chat:typing-indicator` | Server→Client | `{ fromUserId, fromUsername }` | Someone is typing |
| `chat:join-lobby` | Client→Server | — | Join global lobby |
| `chat:leave-lobby` | Client→Server | — | Leave global lobby |
| `guild:chat-send` | Client→Server | `{ guildId, content }` | Send guild message |
| `guild:chat-message` | Server→Client | `{ from, content, timestamp }` | Receive guild message |

### REST Endpoints

**Friends:**
- `GET /api/friends/list` — list friends with online status
- `GET /api/friends/requests` — pending requests
- `POST /api/friends/request` — send friend request
- `POST /api/friends/accept` — accept request
- `POST /api/friends/reject` — reject request
- `POST /api/friends/remove` — remove friend

**Guilds:**
- `POST /api/guilds/create` — create guild
- `GET /api/guilds/my` — my guild info
- `GET /api/guilds/:id` — guild details
- `POST /api/guilds/:id/join` — request to join
- `POST /api/guilds/:id/leave` — leave guild
- `POST /api/guilds/:id/kick` — kick member (leader only)
- `POST /api/guilds/:id/promote` — promote member (leader only)
- `GET /api/guilds/leaderboard` — guild rankings

**Messages:**
- `GET /api/messages/:userId` — get chat history with a user
- `GET /api/messages/guild/:guildId` — get guild chat history

**Profile:**
- `GET /api/profile/:username` — public profile data

---

## Implementation Units

### U1. Backend Models: Friend, Guild, Message

**Goal:** Create Mongoose schemas for Friend requests, Guilds, and Chat Messages.

**Requirements:** Friends, Guilds, Chat

**Dependencies:** None

**Files:**
- Create `game-backend/src/models/Friend.js`
- Create `game-backend/src/models/Guild.js`
- Create `game-backend/src/models/Message.js`

**Approach:**
- **Friend** schema: `{ requester (ObjectId ref User), recipient (ObjectId ref User), status (enum: pending/accepted/blocked) }` with compound index on `(requester, recipient)` and `timestamps: true`
- **Guild** schema: `{ name (unique), tag (3-5 char, unique), description, icon, leader (ObjectId ref User), members: [{ user (ObjectId ref User), role (enum: leader/co-leader/member), joinedAt }], exp, level, createdAt }`
- **Message** schema: `{ sender (ObjectId ref User), receiver (ObjectId ref User, nullable for room), guildId (ObjectId ref Guild, nullable), room (string, nullable), content (string), type (enum: text/system) }` with index on receiver and guildId

**Patterns to follow:** `ChatHistory.js` for message model conventions, `User.js` for enum patterns

**Test scenarios:**
- Friend: create request, duplicates prevented, status transitions (pending→accepted, pending→rejected)
- Guild: create with unique name/tag, add members up to limit, member role assignments
- Message: save with required fields, query by receiver, query by guildId

**Verification:** Models save and query correctly in unit tests.

---

### U2. Socket Auth Middleware

**Goal:** Add JWT authentication to Socket.IO connections so socket events can identify users securely.

**Requirements:** Chat, Friends (online status)

**Dependencies:** U1

**Files:**
- Create `game-backend/src/middlewares/socketAuth.js`
- Modify `game-backend/src/app.js` — register auth middleware on io

**Approach:**
- Socket auth middleware: read token from `socket.handshake.auth.token` or `socket.handshake.query.token`, verify with `jwt.verify`, set `socket.data.user = decoded`
- In `app.js`, call `io.use(socketAuth)` before passing io to handlers
- Update existing game handlers to use `socket.data.user.id` instead of `socket.data.username` (which was client-set and insecure)

**Patterns to follow:** `authMiddleware.js` for JWT verification pattern

**Test scenarios:**
- Connection with valid token → socket.data.user set
- Connection with invalid/missing token → connection rejected with error
- Existing game handlers still work after migration

**Verification:** Socket connections authenticate properly; game handlers continue working.

---

### U3. Backend: Friend API Routes + Controller

**Goal:** CRUD API for friend requests and management.

**Requirements:** Friends

**Dependencies:** U1

**Files:**
- Create `game-backend/src/routes/friendRoutes.js`
- Create `game-backend/src/controllers/friendController.js`
- Modify `game-backend/src/app.js` — register `/api/friends`

**Approach:**
- Controller methods: `getList`, `getRequests`, `sendRequest`, `acceptRequest`, `rejectRequest`, `removeFriend`
- `sendRequest`: check not already friends, not self, create Friend doc with status `pending`
- `acceptRequest`: update status to `accepted`, return friend data
- Socket emission: on `acceptRequest`, emit `friend:online` to both parties; on `removeFriend`, emit removal event

**Patterns to follow:** `shopController.js` for controller structure, `shopRoutes.js` for route structure

**Test scenarios:**
- Send request to non-friend → pending created
- Send duplicate request → 400 error
- Accept request → status changed, socket event emitted
- Reject request → document deleted
- Remove friend → document deleted
- List friends → returns accepted friends only

**Verification:** All friend endpoints work with Postman/curl.

---

### U4. Backend: Guild API Routes + Controller

**Goal:** CRUD API for guild management.

**Requirements:** Guilds

**Dependencies:** U1

**Files:**
- Create `game-backend/src/routes/guildRoutes.js`
- Create `game-backend/src/controllers/guildController.js`
- Modify `game-backend/src/app.js` — register `/api/guilds`

**Approach:**
- Controller methods: `create`, `getMyGuild`, `getGuild`, `join`, `leave`, `kick`, `promote`, `leaderboard`
- `create`: validate name/tag uniqueness, set creator as leader, auto-join
- Guild EXP accumulates from member activity (sum of member EXP)
- Leaderboard: aggregate guilds sorted by total EXP

**Patterns to follow:** Standard CRUD controller pattern

**Test scenarios:**
- Create guild with unique name → success
- Create guild with duplicate name → 400 error
- Join guild → member added
- Leave guild → member removed, if leader → new leader assigned or guild dissolved
- Promote member → role updated
- Leaderboard → sorted by EXP descending

**Verification:** All guild endpoints work correctly.

---

### U5. Backend: Message History API

**Goal:** REST endpoints for fetching message history (1-1 and guild chat).

**Requirements:** Chat

**Dependencies:** U1

**Files:**
- Create `game-backend/src/routes/messageRoutes.js`
- Create `game-backend/src/controllers/messageController.js`
- Modify `game-backend/src/app.js` — register `/api/messages`

**Approach:**
- `GET /api/messages/:userId` — get messages between current user and target user, sorted by timestamp, paginated (limit 50)
- `GET /api/messages/guild/:guildId` — get guild messages, sorted by timestamp, paginated
- Only return messages where current user is sender or receiver (for 1-1)
- Only return guild messages if user is member of that guild

**Test scenarios:**
- Get messages between two users → correct messages returned
- Get guild messages as member → success
- Get guild messages as non-member → 403
- Pagination works (limit/offset)

**Verification:** Message history loads correctly.

---

### U6. Backend: Public Profile API

**Goal:** Public profile endpoint returning user stats, friends, achievements.

**Requirements:** Public Profile

**Dependencies:** U1

**Files:**
- Create `game-backend/src/routes/profileRoutes.js`
- Create `game-backend/src/controllers/profileController.js`
- Modify `game-backend/src/app.js` — register `/api/profile`

**Approach:**
- `GET /api/profile/:username` — lookup user by username, return public data: avatar, level, coins, exp, totalScore, unlockedAchievements, favoriteGames, friendCount, guild (if any)
- No auth required (public endpoint)
- Exclude sensitive fields (email, password, inventory, quests)

**Test scenarios:**
- Get existing profile → correct public data
- Get non-existent profile → 404
- Profile excludes sensitive fields

**Verification:** Public profile endpoint returns correct data.

---

### U7. Backend: Socket Chat Handler

**Goal:** Real-time chat events: 1-1 messaging, lobby chat, guild chat, typing indicators, online status.

**Requirements:** Chat, Friends

**Dependencies:** U2, U3, U4

**Files:**
- Create `game-backend/src/socket/chatHandler.js`
- Modify `game-backend/src/app.js` — register chatHandler

**Approach:**
- On connection: join user to personal room `user:<userId>` for targeted messages
- `chat:send-message`: validate friendship (for 1-1), save Message doc, emit `chat:new-message` to recipient's personal room
- `chat:join-lobby`: join socket to `room:lobby`
- `chat:typing`: emit `chat:typing-indicator` to recipient's personal room
- `guild:chat-send`: validate guild membership, save Message doc, emit to `guild:<guildId>` room
- On disconnect: broadcast `friend:offline` to all friends
- On connect: broadcast `friend:online` to all friends

**Patterns to follow:** `chessHandler.js` for handler structure

**Test scenarios:**
- Send 1-1 message between friends → recipient receives event
- Send 1-1 message to non-friend → error
- Send guild message as member → guild room receives event
- Send guild message as non-member → error
- Typing indicator → recipient receives it
- Online/offline broadcast on connect/disconnect

**Verification:** Real-time messaging works end-to-end.

---

### U8. Frontend: Shared Socket Client + Stores

**Goal:** Create socket.io client connection and 3 Zustand stores: useFriendStore, useChatStore, useGuildStore.

**Requirements:** Chat, Friends, Guilds

**Dependencies:** U3, U4, U5

**Files:**
- Create `game-frontend/src/services/socket.js`
- Create `game-frontend/src/store/useFriendStore.js`
- Create `game-frontend/src/store/useChatStore.js`
- Create `game-frontend/src/store/useGuildStore.js`

**Approach:**
- `socket.js`: create singleton socket connection using `io()`, pass token via `auth: { token }`, export socket instance and a provider React context for access
- `useFriendStore.js`: state `{ friends: [], requests: [], loading }`, actions `fetchFriends`, `sendRequest`, `acceptRequest`, `rejectRequest`, `removeFriend` via REST API. Listen for socket events `friend:online`, `friend:offline`, `friend:request-received`, `friend:accepted`
- `useChatStore.js`: state `{ messages: {}, activeChat: null, typingUsers: {} }`, actions `fetchMessages`, `sendMessage`. Listen for `chat:new-message`, `chat:typing-indicator`
- `useGuildStore.js`: state `{ myGuild: null, guilds: [], leaderboard: [], loading }`, actions `createGuild`, `fetchMyGuild`, `fetchLeaderboard`, `joinGuild`, `leaveGuild`

**Patterns to follow:** `useShopStore.js`, `useAuthStore.js`, `api.js`

**Test expectation:** Stores work correctly with mocked API responses. Verifiable by console logging during development.

---

### U9. Frontend: Social Page (Friends + Chat)

**Goal:** A `/social` page combining friend list and chat interface.

**Requirements:** Friends, Chat

**Dependencies:** U8

**Files:**
- Create `game-frontend/src/pages/Social.jsx`
- Create `game-frontend/src/components/FriendList.jsx`
- Create `game-frontend/src/components/ChatWindow.jsx`
- Create `game-frontend/src/components/FriendRequestItem.jsx`
- Modify `game-frontend/src/App.jsx` — add `/social` route
- Modify `game-frontend/src/components/Header.jsx` — add Social nav link

**Approach:**
- **Social page layout:** left sidebar (friend list + requests), right panel (chat window). Responsive: tabs on mobile
- **FriendList component:** shows online/offline status, click to open chat, "Add friend" button, pending request count badge
- **ChatWindow component:** message bubble UI, input field, send on Enter, typing indicator, load more on scroll to top
- **FriendRequestItem:** accept/reject buttons for incoming requests
- Add route `<Route path="/social" element={<Social />} />` in App.jsx
- Add "Social" link in Header with people icon

**Patterns to follow:** `Shop.jsx` for page structure, `Chatbot.jsx` for chat bubble styling

**Test expectation:** Page renders, friend list loads, chat works. Manually verifiable.

---

### U10. Frontend: Guild Page

**Goal:** A `/guild` page for guild management and chat.

**Requirements:** Guilds

**Dependencies:** U8, U9

**Files:**
- Create `game-frontend/src/pages/Guild.jsx`
- Create `game-frontend/src/components/GuildCard.jsx`
- Create `game-frontend/src/components/GuildCreateModal.jsx`
- Create `game-frontend/src/components/GuildMemberList.jsx`
- Modify `game-frontend/src/App.jsx` — add `/guild` route
- Modify `game-frontend/src/components/Header.jsx` — add Guild nav link

**Approach:**
- **Guild page:** if no guild → show create/join view. If has guild → show guild info + member list + guild chat
- **GuildCard:** display guild name, tag, icon, member count, EXP
- **GuildCreateModal:** modal form with name, tag, description, icon selector
- **GuildMemberList:** list members with roles, kick/promote buttons for leader
- **Guild chat:** reuse ChatWindow component with mode="guild" prop
- Add routes and nav links

**Test expectation:** Guild CRUD works end-to-end. Manually verifiable.

---

### U11. Frontend: Public Profile Page

**Goal:** A `/profile/:username` page showing public user info.

**Requirements:** Public Profile

**Dependencies:** U6, U8

**Files:**
- Create `game-frontend/src/pages/PublicProfile.jsx`
- Modify `game-frontend/src/App.jsx` — add `/profile/:username` route
- Modify `game-frontend/src/components/FriendList.jsx` — click username navigates to public profile

**Approach:**
- Fetch data from `GET /api/profile/:username`
- Display: avatar (AvatarDisplay), username, level, EXP bar, coins, totalScore
- Show unlocked achievements as badges
- Show friend count, guild name (if in one)
- If viewing own profile, show "Edit Profile" button
- Add link from friend list usernames to public profile

**Patterns to follow:** `Shop.jsx` for page structure, `AvatarDisplay.jsx` for avatar rendering

**Test expectation:** Public profile loads for any user, shows correct data. Manually verifiable.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Socket auth breaks existing game handlers | Medium | High | Test chess/othello after adding socket auth middleware |
| Race conditions in friend request | Low | Medium | Use unique compound index on (requester, recipient) |
| Chat history grows unbounded | Low | Medium | Add TTL index or pagination cap (50 messages per load) |
| Guild name collisions | Low | Low | Unique index on name and tag |

## Deferred Implementation Notes

- Online status uses Socket.IO connection state — no periodic ping needed
- Message read receipts deferred to follow-up
- Guild EXP calculation: sum of member EXP (recalculated on member join/leave)

## Verification Strategy

1. After U2: verify all game socket handlers still work
2. After U7: end-to-end socket test with browser console
3. After U9-U11: page routing, UI rendering
4. Full flow: login → add friend → chat → create guild → guild chat → view public profile
