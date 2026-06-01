# MathQuest - Tài liệu dự án

## Tổng quan

MathQuest là game toán học / tư duy kết hợp hệ thống RPG (Coin, EXP, Level). Người chơi có thể chơi nhiều game mini, kiếm điểm, lên level, mua vật phẩm trang trí avatar, và cạnh tranh trên bảng xếp hạng.

## Cấu trúc thư mục

```
D:\MATHQUEST\
├── game-backend/           # Node.js + Express + MongoDB backend
│   └── src/
│       ├── server.js           # Entry point
│       ├── config/db.js        # Kết nối MongoDB
│       ├── controllers/        # Business logic (8 files)
│       ├── models/             # Mongoose schemas (12 files)
│       ├── routes/             # Express routes (6 files)
│       ├── middlewares/        # Auth & Admin middleware (2 files)
│       ├── services/           # Business services (3 files)
│       ├── seeders/            # Dữ liệu mẫu (2 files)
│       └── socket/             # Socket.IO handlers (1 file)
├── game-frontend/          # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Root component + Router
│   │   ├── components/        # Reusable components (6 files)
│   │   │   └── Auth/          # Login & Register (2 files)
│   │   └── pages/             # Page components (6 files)
│   │       └── Profile/       # Profile tabs (7 files)
│   └── public/js/             # Game logic (JS)
│       ├── games/              # 14 game files
│       └── (managers)         # 6 manager files
└── docs/                   # Tài liệu dự án
    ├── README.md               # File này
    ├── backend.md              # Chi tiết backend
    ├── frontend.md             # Chi tiết frontend React
    └── games.md                # Chi tiết game JS
```

## Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| Backend | Node.js, Express, Mongoose, JWT, Socket.IO |
| Frontend | React 19, Vite, Tailwind CSS, React Router DOM |
| Database | MongoDB |
| Authentication | JWT, Google OAuth, Facebook Login |
| AI Chatbot | Google Gemini 2.5 Flash |
| Realtime | Socket.IO (cờ vua online) |

## Hướng dẫn chạy

### Backend
```bash
cd game-backend
npm install
npm run dev    # Cổng 5000
```

### Frontend
```bash
cd game-frontend
npm install
npm run dev    # Cổng 5173
```

## Chi tiết

- [Backend API](backend.md) — Controllers, Models, Routes, Middlewares, Services
- [Frontend React](frontend.md) — Pages, Components, Auth, Profile
- [Game Engine](games.md) — Tất cả game JS, Managers, Bridge
