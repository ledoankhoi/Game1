# MathQuest — Remaining Work

## ✅ Completed This Cycle
- **Phase 3 (Testing):** Vitest + RTL (frontend), Jest + supertest (backend). Refactored `server.js` → `app.js` + `server.js` for testable exports.
- **Phase 2 (Animation) expanded:** Added GSAP stagger to Shop (shopGridRef) and Profile (profileRef) pages.
- **Phase 4 (State Management):** Zustand installed. Created `useAuthStore`, `useShopStore`, `useGameStore`. Refactored App.jsx, Header, Login, Register, Home, Shop — removed prop drilling, centralized state in stores.

## 📋 Remaining Phases

### Phase 5 — Document Processing (MarkItDown UI)
- Upload UI: drag-and-drop zone, progress bar, file type preview
- Admin knowledge list: view all imported documents, delete
- Error states: file too large, unsupported format, conversion failure

### Phase 6 — CI/CD & Deployment
- GitHub Actions: lint → test → build
- Dockerfiles for backend + frontend
- docker-compose.yml (app + mongo)
- Render/VPS deploy config
