# MathQuest — Agents & Context

## Dự án
MathQuest là game toán học / tư duy với hệ thống RPG (Coin, EXP, Level).
Gồm 2 phần:
- **game-backend/** — Node.js (Express + Mongoose + JWT)
- **game-frontend/** — React (Vite + Tailwind + React Router DOM)

## Kiến trúc
```
game-backend/
├── src/
│   ├── server.js          # Entry point
│   ├── config/            # DB config
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── controllers/       # Logic
│   └── middleware/        # Auth, validation
└── tests/

game-frontend/
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Root component + Router
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API calls (axios)
│   ├── store/            # State management
│   └── utils/            # Helpers
├── index.html
├── vite.config.js
└── tailwind.config.js
```

## Commands
- `npm run dev` (game-backend) — backend server (port 5000)
- `npm run dev` (game-frontend) — frontend dev (port 5173)
- `npm run lint` (game-frontend) — ESLint kiểm tra lỗi
- `npm run build` (game-frontend) — Build production
- `npm test` — chạy test (nếu có)

---

# 🔄 AI Workflow Loop

Đây là vòng lặp làm việc tự động cho AI. Mỗi cycle = 1 lần AI chạy để cải thiện dự án.

## Phase 1: Init — Khởi tạo
**Mục tiêu:** Load context, hiểu trạng thái hiện tại.

Bắt buộc chạy:
```bash
# 1. Kiểm tra lỗi hiện tại
cd game-frontend && npm run lint

# 2. Xem trạng thái git
git status
git diff --stat

# 3. Đọc AGENTS.md + README.md

# 4. Kiểm tra codegraph index
codegraph_status
```

## Phase 2: Research — Nghiên cứu
**Mục tiêu:** Xác định vấn đề cần giải quyết.

### A. Scan lỗi từ lint
Nếu có error → fix ngay (Phase 3).
Nếu có warning → đưa vào todo list.

### B. Kiểm tra danh sách vấn đề tồn đọng
- **P0 - CRITICAL:** Lỗi runtime, crash
- **P1 - HIGH:** Lỗi logic, thiếu validation
- **P2 - MEDIUM:** UI/UX issues, code style
- **P3 - LOW:** Tối ưu hóa, tái cấu trúc

### C. Kiểm tra file nào bị thay đổi
```bash
git status
git diff --stat
```
Đọc các file đã thay đổi để hiểu context.

## Phase 3: Plan — Lập kế hoạch
**Mục tiêu:** Tạo todo list cho cycle hiện tại.

Nguyên tắc:
1. **Mỗi cycle fix tối đa 3-5 issues** (không tham lam)
2. **Fix theo thứ tự ưu tiên:** P0 → P1 → P2 → P3
3. **Mỗi issue = 1 task riêng** trong todowrite
4. **Không làm nhiều hơn yêu cầu** (simplicity first)
5. **Nếu issue lớn (>50 dòng) → chia nhỏ**

Output: `todowrite` với danh sách task.

## Phase 4: Develop — Phát triển / Cải tiến
**Mục tiêu:** Implement từng task một.

### Quy tắc khi code
1. Đọc file gốc trước khi sửa (dùng Read tool)
2. Chỉ sửa đúng phần cần sửa (surgical changes)
3. Giữ nguyên coding convention của file đó
4. KHÔNG thêm tính năng không được yêu cầu
5. KHÔNG thêm comment trừ khi cần thiết
6. Mỗi function <= 30 dòng, tối đa 2 cấp lồng, tối đa 3 tham số

## Phase 5: Verify — Xác minh
**Mục tiêu:** Đảm bảo code không lỗi, đúng business logic.

### Bước 1: Kiểm tra lint
```bash
cd game-frontend && npm run lint
```
- Nếu có error → quay lại Phase 4 fix
- Nếu có warning → đánh giá có nên fix không
- Nếu clean → sang bước 2

### Bước 2: Kiểm tra logic
- Đọc lại diff để đảm bảo chỉ sửa những gì cần sửa
- Kiểm tra import không bị thiếu
- Kiểm tra tên biến/hàm có ý nghĩa

### Bước 3: Update todowrite
- Task hoàn thành → mark `completed`
- Nếu phát sinh issue mới → thêm task mới

## Phase 6: Loop — Kết thúc cycle
**Mục tiêu:** Tự động quyết định có tiếp tục không (không hỏi user).

Nếu còn task trong todowrite:
- Quay lại Phase 4 (Develop) cho task tiếp theo

Nếu hết task:
1. Kiểm tra lại toàn bộ dự án
2. Nếu còn issue P0/P1/P2:
   - Tự động bắt đầu cycle mới (quay lại Phase 1) — KHÔNG DỪNG
3. Nếu không còn issue:
   - Báo cáo kết quả và kết thúc

## Decision Tree: Khi nào dừng?

```
npm run lint có error?
├── YES → Phase 4 (fix error)
└── NO
    └── Còn task trong todowrite?
        ├── YES → Phase 4 (develop)
        └── NO
            └── Còn issue P0/P1/P2?
                ├── YES → Phase 1 (cycle mới, tự động — KHÔNG DỪNG)
                └── NO → Báo cáo hoàn thành, kết thúc
```

## Status Tracking
Dùng `todowrite` để track progress. Mỗi cycle:
- `pending` = chưa làm
- `in_progress` = đang làm (chỉ 1 task)
- `completed` = đã xong + verified
- `cancelled` = không cần nữa

---
## Engineering Rules (mttpocock/skills)

### TDD Rule
Khi thêm tính năng mới:
1. Viết test trước (Red)
2. Code tối thiểu để pass (Green)
3. Refactor nếu cần

### Diagnose Rule
Khi gặp bug:
1. Analyze — đọc log, xác định vị trí
2. Gather Context — đọc code xung quanh
3. Hypothesize — 1-3 giả thuyết
4. Fix & Verify — sửa ngắn gọn, chạy lint/test

### Git Guardrails
- Không force push, không commit secrets/node_modules
- Commit message: `<type>(<scope>): <subject>` (vd: `feat(shop): add coin animation`)
- Luôn chạy lint trước commit

### Code Quality
- Mỗi function ≤ 30 dòng, tối đa 2 cấp lồng ghép
- Tối đa 3 tham số mỗi function
- Dùng early return, tránh else không cần thiết

---
## Anthropic Skills

Dự án đã clone [anthropics/skills](https://github.com/anthropics/skills) vào `anthropic-skills/` — bộ kỹ năng cho AI agent từ Anthropic.

### Các skill có sẵn trong `.opencode/skills/`

| Skill | File | Mô tả |
|---|---|---|
| frontend-design | `.opencode/skills/frontend-design.md` | Thiết kế UI/UX frontend |
| webapp-testing | `.opencode/skills/webapp-testing.md` | Kiểm thử web app |
| canvas-design | `.opencode/skills/canvas-design.md` | Đồ họa Canvas |
| mcp-builder | `.opencode/skills/mcp-builder.md` | Xây dựng MCP server |
| web-artifacts-builder | `.opencode/skills/web-artifacts-builder.md` | Tạo web artifacts |
| documents-skill | `.opencode/skills/documents-skill.md` | Tạo DOCX/PDF/PPTX/XLSX |
| gsap-core | `.opencode/skills/gsap-core.md` | GSAP Core API — to/from/fromTo/easing/stagger |
| gsap-timeline | `.opencode/skills/gsap-timeline.md` | GSAP Timeline — sequencing, position param |
| gsap-scrolltrigger | `.opencode/skills/gsap-scrolltrigger.md` | GSAP ScrollTrigger — scroll animation, pin |
| gsap-plugins | `.opencode/skills/gsap-plugins.md` | GSAP Plugins — Flip, Draggable, SplitText... |
| gsap-utils | `.opencode/skills/gsap-utils.md` | GSAP Utilities — clamp, mapRange, random |
| gsap-react | `.opencode/skills/gsap-react.md` | GSAP + React — useGSAP hook, cleanup |
| gsap-performance | `.opencode/skills/gsap-performance.md` | GSAP Performance — transforms, 60fps |
| gsap-frameworks | `.opencode/skills/gsap-frameworks.md` | GSAP + Vue/Svelte — lifecycle, cleanup |

### Cách dùng
Load skill: dùng `skill` tool với name tương ứng (ví dụ: `frontend-design`, `gsap-core`).
Full skills gốc tại `anthropic-skills/skills/<tên-skill>/SKILL.md` hoặc `gsap-skills/skills/<tên-skill>/SKILL.md`.

<!-- CODEGRAPH_START -->
## CodeGraph

This project has a CodeGraph MCP server (`codegraph_*` tools) configured. CodeGraph is a tree-sitter-parsed knowledge graph of every symbol, edge, and file. Reads are sub-millisecond and return structural information grep cannot.

### When to prefer codegraph over native search

Use codegraph for **structural** questions — what calls what, what would break, where is X defined, what is X's signature. Use native grep/read only for **literal text** queries (string contents, comments, log messages) or after you already have a specific file open.

| Question | Tool |
|---|---|
| "Where is X defined?" / "Find symbol named X" | `codegraph_search` |
| "What calls function Y?" | `codegraph_callers` |
| "What does Y call?" | `codegraph_callees` |
| "What would break if I changed Z?" | `codegraph_impact` |
| "Show me Y's signature / source / docstring" | `codegraph_node` |
| "Give me focused context for a task/area" | `codegraph_context` |
| "See several related symbols' source at once" | `codegraph_explore` |
| "What files exist under path/" | `codegraph_files` |
| "Is the index healthy?" | `codegraph_status` |

### Rules of thumb

- **Answer directly — don't delegate exploration.** For "how does X work" / architecture / trace questions, answer with 2-3 codegraph calls: `codegraph_context` first, then ONE `codegraph_explore` for the source of the symbols it surfaces. Codegraph IS the pre-built index, so spawning a separate file-reading sub-task/agent — or running a grep + read loop — repeats work codegraph already did and costs more for the same answer.
- **Trust codegraph results.** They come from a full AST parse. Do NOT re-verify them with grep — that's slower, less accurate, and wastes context.
- **Don't grep first** when looking up a symbol by name. `codegraph_search` is faster and returns kind + location + signature in one call.
- **Don't chain `codegraph_search` + `codegraph_node`** when you just want context — `codegraph_context` is one call.
- **Don't loop `codegraph_node` over many symbols** — one `codegraph_explore` call returns several symbols' source grouped in a single capped call, while each separate node/Read call re-reads the whole context and costs far more.
- **Index lag**: the file watcher debounces ~500ms behind writes; don't re-query immediately after editing a file in the same turn.

### If `.codegraph/` doesn't exist

The MCP server returns "not initialized." Ask the user: *"I notice this project doesn't have CodeGraph initialized. Want me to run `codegraph init -i` to build the index?"*
<!-- CODEGRAPH_END -->
