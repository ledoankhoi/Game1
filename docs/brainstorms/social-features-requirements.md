# Social Features - Requirements

## Mục tiêu
Thêm hệ thống social cho MathQuest: Chat realtime, Kết bạn, Guild/Clan, Profile công khai.

## Tính năng

### 1. Friends System
- Gửi/nhận/chấp nhận/từ chối lời mời kết bạn
- Danh sách bạn bè (online/offline status)
- Xóa bạn
- Backend: Friend model + routes + socket events

### 2. Real-time Chat
- Chat 1-1 giữa bạn bè
- Chat phòng global (lobby)
- Chat guild (nếu đã vào guild)
- Socket.io events: send_message, typing, online_status
- Lưu lịch sử chat (ChatHistory model đã có)

### 3. Guild/Clan System
- Tạo guild (name, tag, description, icon)
- Gửi yêu cầu tham gia / mời
- Guild chat room
- Bảng xếp hạng guild (tổng EXP/coin của member)
- Phân quyền: Leader, Co-leader, Member

### 4. Public Profile
- Mỗi user có profile public: `/profile/:username`
- Hiển thị: avatar, level, coins, thành tích, game đã chơi
- Friends list public
- Nếu là chủ sở hữu: nút Edit Profile, Settings

## Non-goals
- Voice/video call
- Chat nhóm tự tạo (chỉ guild chat)
- Marketplace giữa users

## Tech Stack (giữ nguyên)
- Frontend: React + Tailwind + Socket.io-client
- Backend: Express + Socket.io + Mongoose
