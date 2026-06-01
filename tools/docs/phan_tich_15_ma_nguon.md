# Phân tích 15 mã nguồn — Áp dụng cho MathQuest

## Tổng quan dự án
- **MathQuest:** Game toán học / tư duy + RPG (Coin, EXP, Level)
- **Frontend:** React + Vite + Tailwind + React Router DOM
- **Backend:** Node.js + Express + Mongoose + JWT
- **Mục tiêu:** Tự động hóa vòng đời phát triển với AI Agent

---

## Nhóm 1: Áp dụng NGAY (tích hợp sẵn hoặc bổ sung tức thì)

### 1. greensock/gsap-skills
- **Dùng để làm gì:** Animation cho game — hiệu ứng nhân vật, chuyển cảnh, điểm số (+EXP, +Coin), mở rương, battle effects.
- **Tích hợp:** `npm install gsap` — đã có sẵn GSAP skills trong `.opencode/skills/`.
- **Các skill cụ thể:**
  - `gsap-core`: to/from/fromTo, ease, stagger
  - `gsap-timeline`: Chuỗi animation phức tạp
  - `gsap-scrolltrigger`: Animation khi cuộn (nếu có landing page)
  - `gsap-react`: useGSAP hook, cleanup khi unmount
  - `gsap-plugins`: SplitText, Draggable, Flip
  - `gsap-performance`: Tối ưu 60fps
- **Giá trị:** Tăng trải nghiệm game, tạo cảm giác "game thực sự".

### 2. anthropics/skills
- **Dùng để làm gì:** Kỹ năng mẫu cho AI Agent — đã clone và dùng.
- **Tích hợp:** Skills trong `.opencode/skills/` (frontend-design, webapp-testing, canvas-design...).
- **Cần bổ sung:** Các skill còn lại (documents-skill cho tạo tài liệu, web-artifacts-builder).
- **Giá trị:** Mở rộng khả năng AI Agent, đang dùng rồi.

### 3. NextLevelBuilder/ui-ux-pro-max-skill
- **Dùng để làm gì:** Chuẩn hóa UI/UX — Design Tokens, brand guidelines, component styling.
- **Tích hợp:** Tạo `.claude/skills/` hoặc import rules.
- **Các kỹ năng:**
  - **brand:** Logo, bảng màu, font — định hình thương hiệu MathQuest
  - **design-system:** Design Tokens + Tailwind integration
  - **ui-styling:** Component UI, responsive, accessibility
- **Giá trị:** Giúp giao diện nhất quán, AI tự động tuân thủ design system.

### 4. mttpocock/skills (Matt Pocock)
- **Dùng để làm gì:** Quy trình kỹ nghệ phần mềm cho AI Agent.
- **Các kỹ năng:**
  - **diagnose:** Phân tích lỗi → giả thuyết → fix
  - **tdd:** Red → Green → Refactor
  - **prototype:** Tạo prototype nhanh
  - **git-guardrails:** Chặn lệnh Git nguy hiểm
  - **handoff:** Bàn giao công việc giữa các phiên
- **Giá trị:** AI Agent làm việc có quy trình, ít lỗi hơn.

---

## Nhóm 2: TỰ ĐỘNG HÓA & WORKFLOW

### 5. bloopai/vibe-kanban
- **Dùng để làm gì:** Hệ điều hành Kanban cho AI Agent (tự động hóa vòng đời phát triển).
- **Phân tích sau khi clone:**
  - **Cấu trúc:** 34 Rust crates backend + 5 npm packages frontend — rất lớn
  - **Ngôn ngữ:** Rust (nightly) — khác hoàn toàn stack MathQuest (Node.js)
  - **Cách chạy:** Cần Rust nightly, pnpm, cargo-watch, sqlx-cli — setup phức tạp
  - **AI executors:** Hỗ trợ Claude Code, OpenCode, Codex, Copilot, Gemini, Cursor, Qwen, Droid, Amp
  - **Git Worktree:** Mỗi workspace có worktree riêng, branch riêng, isolation hoàn toàn
  - **Trạng thái:** **Đã sunset** (ngừng hoạt động) — không còn phát triển
- **Kết luận:** ❌ **KHÔNG nên tích hợp.** Rust stack khác, quy mô quá lớn, project đã sunset. Không thực tế cho MathQuest.
- **Bài học:** Pattern executor enum dispatch + MCP protocol integration có thể tham khảo.

### 6. fission-ai/openspec
- **Dùng để làm gì:** Spec-Driven Development — viết spec → AI tự code.
- **Phân tích sau khi clone:**
  - **Cấu trúc:** CLI Node.js (Commander + Zod + YAML), nhẹ, dễ cài
  - **Luồng:** `proposal.md` → `specs/**/spec.md` → `design.md` → `tasks.md` → implement → archive
  - **Tích hợp OpenCode:** ✅ Có adapter riêng tại `src/core/command-generation/adapters/opencode.ts`
    - Tạo file `.opencode/commands/opsx-*.md` (dùng hyphen: `/opsx-propose`)
    - Tạo skill `.opencode/skills/openspec-*/SKILL.md`
  - **Cách dùng với MathQuest:**
    ```bash
    npx @fission-ai/openspec init --tools opencode
    ```
  - **Tác động:** Tạo thư mục `openspec/` + file command/skill — không ảnh hưởng code
  - **Kết hợp workflow:** `/opsx-propose` → `/opsx-apply` → `/opsx-archive`
- **Kết luận:** ✅ **NÊN dùng.** Node.js stack tương thích, tích hợp OpenCode sẵn, nhẹ, an toàn.
- **Cài đặt:** `cd game-frontend && npx @fission-ai/openspec init --tools opencode`
- **Trạng thái:** ✅ **Đã cài đặt** — workspace tại `openspec/`, skills + commands sẵn sàng.

### 7. github/github-mcp-server
- **Dùng để làm gì:** AI Agent tương tác trực tiếp với GitHub API qua MCP.
- **Phân tích sau khi clone:**
  - **Cấu trúc:** Go server với ~80 tools chia làm 17 toolsets
  - **Cách chạy:** 
    - **Remote** (khuyên dùng): URL `https://api.githubcopilot.com/mcp/` — không cần cài
    - **Local**: Docker `ghcr.io/github/github-mcp-server` hoặc build Go 1.25
  - **Authentication:** GitHub PAT (personal access token) hoặc OAuth
  - **OpenCode tích hợp:** Cấu hình MCP trong `opencode.json`
    ```json
    { "mcp": { "github": { "type": "remote", "url": "https://api.githubcopilot.com/mcp/", "headers": { "Authorization": "Bearer {env:GITHUB_PERSONAL_ACCESS_TOKEN}" } } } }
    ```
  - **Tools chính cho MathQuest:**
    - `issue_write` — AI tự tạo issue cho bug/feature
    - `create_pull_request` — AI tự tạo PR
    - `search_code` — tìm code trong repo
    - `pull_request_read` — review PR
    - `get_file_contents` — đọc file
    - `create_branch` / `push_files` — tạo branch và push code
  - **Yêu cầu:** GitHub PAT với scope `repo`
- **Kết luận:** ✅ **NÊN dùng.** Cấu hình MCP đơn giản, không cần build, có thể dùng remote server.
- **Trạng thái:** ✅ **Đã bật** — `enabled: true` trong opencode.json, GitHub PAT có trong `.env`.

### 8. every-inc/compound-engineering-plugin
- **Dùng để làm gì:** Bộ 37 skills + 43 agents cho engineering workflow — chạy trên OpenCode.
- **Phân tích sau khi clone:**
  - **Cấu trúc:** Claude Plugin gốc, converter CLI (Bun/TypeScript) để chuyển sang OpenCode
  - **OpenCode support:** ✅ Đầy đủ — converter riêng `claude-to-opencode.ts` + writer `opencode.ts`
  - **Cách cài:**
    ```bash
    bunx @every-env/compound-plugin install compound-engineering --to opencode
    ```
  - **Sau khi cài, OpenCode có:**
    - `/ce-plan` — lập kế hoạch chi tiết
    - `/ce-work` — thực thi plan có task tracking
    - `/ce-code-review` — 21 reviewer agents chạy song song (correctness, security, performance...)
    - `/ce-debug` — root-cause analysis + fix
    - `/ce-compound` — lưu knowledge vào `docs/solutions/`
    - `/ce-demo-reel` — quay GIF demo
    - `/ce-brainstorm` — brainstorming
  - **Tích hợp workflow MathQuest:**
    - `/ce-brainstorm` → `/ce-plan` → `/ce-work` → `/ce-code-review` → `/ce-compound`
    - Khớp với AGENTS.md: Research → Plan → Develop → Verify → Loop
  - **⚠️ Lưu ý Windows:** Skills dùng `bash` tool, Unix paths (`/tmp/`). Có thể cần WSL hoặc dùng làm reference.
- **Kết luận:** ✅ **NÊN dùng** (nếu có WSL) hoặc dùng làm reference cho workflow. Tích hợp sâu với OpenCode, workflow khớp hoàn hảo với MathQuest.
- **Trạng thái:** ✅ **Đã cài đầy đủ** — 35 skills + 47 agents trong `.opencode/skills/` và `.opencode/agents/`.

---

## Nhóm 3: CÔNG CỤ HỖ TRỢ PHÁT TRIỂN

### 9. minishlab/semble
- **Dùng để làm gì:** Hybrid code search cho AI Agent (embedding + BM25).
- **Tích hợp:** `pip install semble`, chạy MCP Server.
- **Giá trị:** Giúp AI tìm đúng code cần sửa nhanh hơn — hữu ích khi codebase lớn dần.

### 10. upstash/context7
- **Dùng để làm gì:** Tra cứu ngữ cảnh (docs, source code) real-time cho AI.
- **Tích hợp:** `npx context7 setup`, cấu hình MCP.
- **Giá trị:** AI hiểu sâu codebase và thư viện third-party hơn, tăng độ chính xác khi code.

### 11. abi/screenshot-to-code
- **Dùng để làm gì:** Ảnh chụp → code (HTML/Tailwind/React/Vue).
- **Tích hợp:** Docker Compose hoặc Poetry + Yarn.
- **Giá trị:** Hữu ích khi cần chuyển design từ Figma/ảnh thành component nhanh. Không dùng thường xuyên.

### 12. github/spec-kit
- **Dùng để làm gì:** Template viết đặc tả kỹ thuật chuẩn.
- **Giá trị:** Dùng template cho các tính năng lớn.

---

## Nhóm 4: KHÔNG ÁP DỤNG

### 13. digitalplatdev/freedomain
- **Lý do:** Cung cấp tên miền miễn phí (`.tk`, `.ml`, `.ga`...). Phải tự triển khai hệ thống (WHOIS server + Cloudflare). Tốn công hơn đăng ký nhanh qua DuckDNS/Afraid.
- **Thay thế:** DuckDNS (miễn phí, đơn giản).

### 14. microsoft/markitdown
- **Lý do:** Chuyển đổi DOCX/PDF/ảnh → Markdown cho LLM. Không liên quan đến game.

### 15. supabase-community/supabase-mcp
- **Lý do:** Quản lý Supabase (PostgreSQL, Storage). MathQuest dùng MongoDB — không dùng Supabase.

---

## Bảng tổng hợp mức độ ưu tiên

| Mức | # | Dự án | Hành động |
|:---:|:-:|-------|-----------|
| **P0** | 1 | gsap-skills | `npm install gsap`, dùng ngay |
| **P0** | 2 | anthropics/skills | Đã dùng, tiếp tục |
| **P0** | 3 | ui-ux-pro-max-skill | Tạo Design System cho frontend |
| **P0** | 4 | mttpocock/skills | Tích hợp engineering skills |
| **P1** | 5 | vibe-kanban | ⛔ Không dùng (Rust stack, sunset) |
| **P1** | 6 | openspec | ✅ Đã init — workspace + skills/commands sẵn sàng |
| **P1** | 7 | github-mcp-server | ✅ Đã bật — `enabled: true`, PAT có trong `.env` |
| **P1** | 8 | compound-engineering-plugin | ✅ Đã cài — 35 skills + 47 agents |
| **P2** | 9 | semble | Code search (khi codebase lớn) |
| **P2** | 10 | context7 | Context cho AI |
| **P2** | 11 | screenshot-to-code | Prototype nhanh |
| **P2** | 12 | spec-kit | Template spec |
| **P3** | 13 | freedomain | Domain miễn phí — dùng DuckDNS thay thế |
| **-** | 14 | markitdown | Không áp dụng |
| **-** | 15 | supabase-mcp | Không áp dụng |

## Lộ trình đề xuất

1. ~~Ngay lập tức: Bổ sung GSAP animation + UI/UX skill + engineering skills~~ ✅ Đã xong
2. ~~Tuần này: Cài openspec + compound-engineering-plugin + github-mcp-server → tự động hóa workflow~~ ✅ Đã xong
3. **Tuần sau:** Thêm semble/context7 cho AI hiểu codebase hơn
4. **Khi cần:** screenshot-to-code, spec-kit

---

## Hướng dẫn sử dụng — Quy trình tự động hóa AI

### Luồng chính: Compound Engineering
Dùng trong chat OpenCode để phát triển tính năng:

| Bước | Lệnh | Mô tả |
|:----:|------|-------|
| 1 | `/ce-brainstorm` | Khởi tạo ý tưởng, khám phá yêu cầu |
| 2 | `/ce-plan` | Lập kế hoạch chi tiết, chia task |
| 3 | `/ce-work` | Thực thi code theo plan |
| 4 | `/ce-code-review` | Review code với 21 agent chuyên biệt |
| 5 | `/ce-compound` | Lưu knowledge vào `docs/solutions/` |
| 6 | `/ce-commit` | Commit code theo chuẩn conventional commit |

### Luồng Spec-Driven: OpenSpec
Dùng khi cần quy trình chặt chẽ (tính năng lớn, có spec rõ ràng):

| Bước | Lệnh | Mô tả |
|:----:|------|-------|
| 1 | `/opsx-propose "tên tính năng"` | Tạo proposal + design + tasks |
| 2 | `/opsx-apply` | Implement code theo tasks |
| 3 | `/opsx-archive` | Kết thúc change, lưu lại |

### Luồng Debug
Khi gặp lỗi hoặc bug:

| Bước | Lệnh | Mô tả |
|:----:|------|-------|
| 1 | `/ce-debug` | Phân tích root-cause + đề xuất fix |
| 2 | Fix code | Sửa lỗi |
| 3 | `/ce-code-review` | Kiểm tra lại code |

### GitHub MCP (tự động)
Đã bật sẵn — AI có thể tạo issue, PR, search code trực tiếp qua GitHub mà không cần lệnh riêng.
