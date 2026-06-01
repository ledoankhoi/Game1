# Trò chuyện với Gemini - Tổng hợp nội dung

## I. Kho lưu trữ greensock/gsap-skills

Chào bạn! Kho lưu trữ mã nguồn này là tập hợp các tài liệu hướng dẫn chính thức (gọi là AI Skills) được thiết kế để huấn luyện và định hướng cho các AI Agent (như Cursor, Claude Code, GitHub Copilot hay Gemini) cách viết, tối ưu hóa và sửa lỗi mã nguồn sử dụng thư viện hoạt ảnh GSAP (GreenSock Animation Platform).

Dưới đây là tóm tắt toàn bộ cấu trúc và thông tin quan trọng nhất từ mã nguồn bạn đã tải lên:

### 1. Thay đổi quan trọng về Bản quyền & Cài đặt (CỰC KỲ QUAN TRỌNG)
- GSAP hiện tại hoàn toàn MIỄN PHÍ: Sau khi Webflow mua lại GSAP, gói trả phí "Club GSAP" đã bị hủy bỏ.
- Tất cả các Plugin nâng cao (như SplitText, MorphSVG, ScrollSmoother, Flip,...) giờ đây đều miễn phí cho mọi mục đích sử dụng, kể cả thương mại.
- Cài đặt đơn giản: Bạn chỉ cần cài đặt gói công khai từ npm: `npm install gsap`. KHÔNG cần cấu hình tệp .npmrc, không cần mã token xác thực hay truy cập vào registry riêng của GreenSock như trước đây.

### 2. Cấu trúc thư mục của dự án
- `README.md` / `AGENTS.md`: Giới thiệu dự án và quy định cách viết tài liệu hướng dẫn cho AI.
- `.github/copilot-instructions.md` & `.github/instructions/`: Các quy tắc định hình hành vi cho GitHub Copilot khi lập trình JavaScript/React/ScrollTrigger.
- `examples/`: Các dự án mẫu cực kỳ tối giản chạy bằng Vanilla JS, React (Sử dụng Vite), Vue 3, và Nuxt 4 để làm quy chuẩn thực tế.
- `skills/`: Thư mục cốt lõi chứa các tệp SKILL.md tương ứng với từng kỹ năng cụ thể của GSAP:
  - `gsap-core`: Cách dùng gsap.to(), from(), fromTo(), các dạng ease, cơ chế stagger, và thiết kế hiệu ứng hỗ trợ Responsive/Tắt hoạt ảnh vì khả năng tiếp cận (gsap.matchMedia()).
  - `gsap-timeline`: Quản lý chuỗi hoạt ảnh phức tạp bằng Timeline, tham số vị trí (Position Parameter "<", "+=0.5"), nhãn (labels).
  - `gsap-scrolltrigger`: Hoạt ảnh cuộn trang, ghim phần tử (pin), cuộn mượt, tạo hoạt ảnh cuộn ngang "giả" (containerAnimation), tối ưu hiệu năng cuộn hàng loạt (ScrollTrigger.batch()).
  - `gsap-plugins`: Hướng dẫn chuyên sâu cho các plugin như hiệu ứng chữ (SplitText, ScrambleText), thao tác SVG (DrawSVG, MorphSVG), kéo thả (Draggable), hiệu ứng bố cục (Flip).
  - `gsap-react`: Tích hợp chuẩn trong React/Next.js sử dụng hook @gsap/react (useGSAP), quản lý scope và xử lý dọn dẹp bộ nhớ chống rò rỉ khi unmount component.
  - `gsap-frameworks`: Các mô hình tương tự dành cho Vue 3, Nuxt 4, Svelte (sử dụng gsap.context() và các hook vòng đời).
  - `gsap-performance`: Các mẹo tối ưu hiệu năng đạt 60fps (ưu tiên thuộc tính dịch chuyển x, y thay vì top, left, sử dụng will-change, gsap.quickTo()).

### 3. Các quy tắc cốt lõi (Best Practices) khi dùng GSAP trong dự án
- Luôn đăng ký Plugin trước khi dùng: Chỉ cần gọi một lần ở tệp cấu hình tổng của ứng dụng.
- Ưu tiên thuộc tính Transforms (Biến đổi): Sử dụng các ký hiệu viết tắt của GSAP (x, y, scale, rotation, xPercent) thay vì thay đổi trực tiếp CSS layout (top, left, width, height) để tăng hiệu năng xử lý của GPU.
- Luôn dọn dẹp (Cleanup) hoạt ảnh: Trong React: Sử dụng hook useGSAP() để tự động dọn dẹp. Trong Vue/Svelte: Bao bọc mã nguồn vào trong gsap.context() và gọi ctx.revert().
- Không lạm dụng delay để làm chuỗi hoạt ảnh: Thay vì xâu chuỗi hoạt ảnh bằng cách cộng dồn thời gian delay, hãy dùng gsap.timeline() phối hợp với các tham số vị trí.
- Cấm đặt ScrollTrigger bên trong một Tween con của Timeline: scrollTrigger phải được khai báo ngay tại hàm khởi tạo gsap.timeline().

---

## II. Kho lưu trữ screenshot-to-code (abi/screenshot-to-code)

screenshot-to-code là một công cụ mã nguồn mở mạnh mẽ, cho phép biến đổi các ảnh chụp màn hình (screenshots), bản vẽ phác thảo (mockups) hoặc thiết kế Figma thành mã nguồn ứng dụng (code) hoàn chỉnh, sạch sẽ và có thể chạy được thông qua việc sử dụng trí tuệ nhân tạo (AI).

### Các công nghệ Code được hỗ trợ (Stacks):
- HTML + Tailwind CSS
- HTML + CSS thuần
- React + Tailwind CSS
- Vue + Tailwind CSS
- Bootstrap
- Ionic + Tailwind CSS
- Đồ họa Vector (SVG)

### Các mô hình AI được tích hợp:
- Google: Gemini 3 Flash Preview & Gemini 3.1 Pro Preview (được đánh giá là hoạt động tốt nhất cho dự án này).
- OpenAI: GPT-5.5, GPT-5.2 Codex và GPT-5.4 Mini.
- Anthropic: Claude Opus 4.6 và Claude Opus 4.8.
- Hình ảnh: Flux Schnell (thông qua Replicate) dùng để tự động tạo ra các tài nguyên ảnh tương ứng trong giao diện.

### Kiến trúc Kỹ thuật & Luồng xử lý của Agent
Hệ thống được chia làm hai phần chính: Frontend (React/Vite) và Backend (FastAPI).

Luồng gọi Công cụ của AI Agent (Agent Tool-Calling Flow) ở phía Backend:
1. Khởi chạy Vòng lặp Core (Core Loop): Khi người dùng gửi yêu cầu, hàm AgentEngine._run_with_session() trong backend/agent/engine.py được gọi.
2. Stream kết quả theo thời gian thực: Backend stream các phản hồi từ AI Model về giao diện qua Websocket.
3. Thực thi Công cụ (Tool Execution): Nếu AI yêu cầu gọi công cụ, hệ thống kích hoạt AgentToolRuntime.execute(). Các công cụ: create_file, edit_file, generate_images, remove_background, retrieve_option.
4. Xem trước Code trực tiếp (Live Stream Preview): Hệ thống phân tích cú pháp các tham số đang được AI sinh ra dở dang để hiển thị tăng dần trên giao diện.
5. Cơ chế tiếp tục hội thoại theo cấu trúc từng Provider.

### Hướng dẫn Cài đặt & Chạy Ứng dụng (Local)
**Cách 1: Cài đặt thủ công bằng CLI**
- Backend: `cd backend && poetry install && poetry run uvicorn main:app --reload --port 7001`
- Frontend: `cd frontend && yarn && yarn dev`
- Truy cập: http://localhost:5173

**Cách 2: Sử dụng Docker**
- `echo "OPENAI_API_KEY=sk-your-key" > .env && docker-compose up -d --build`

---

## III. Kho lưu trữ anthropics/skills

That's Anthropic's public Agent Skills repository — a collection of skill folders (instructions, scripts, resources) that teach Claude how to perform specialized tasks. It includes:
- `skills/` — example skills for creative, dev, enterprise, and document tasks
- `spec/` — the Agent Skills specification
- `template/` — a starter template for creating custom skills

### Cấu trúc cơ bản của một "Skill"
- **YAML Frontmatter**: Phần khai báo siêu dữ liệu (name, description).
- **Markdown Instructions**: Phần nội dung chi tiết các bước xử lý, quy tắc, thuật toán.

### Các nhóm kỹ năng mẫu
- **Lập trình và Tự động hóa hệ thống**: mcp-builder, web-artifacts-builder, webapp-testing
- **Xử lý tài liệu chuyên sâu**: docx, xlsx, pdf, doc-coauthoring
- **Sáng tạo và Truyền thông**: algorithmic-art, slack-gif-creator, brand-guidelines, theme-factory, internal-comms

---

## IV. Kho lưu trữ microsoft/markitdown

MarkItDown của Microsoft là một thư viện Python chuyển đổi nhiều định dạng tệp phức tạp thành văn bản Markdown chuẩn cho LLM.

### Cấu trúc và Bản phân phối Dự án
- `packages/markitdown/`: Gói thư viện cốt lõi (Core Library)
- `packages/markitdown-ocr/`: Gói mở rộng hỗ trợ OCR
- `packages/markitdown-mcp/`: Gói máy chủ MCP
- `packages/markitdown-sample-plugin/`: Dự án mẫu viết Plugin

### Các bộ chuyển đổi định dạng
- Tài liệu văn phòng: DOCX, PPTX, XLSX, CSV
- Sách điện tử & Trang web: EPUB, HTML
- Nguồn cấp dữ liệu & Tra cứu trực tuyến: RSS, Wikipedia, YouTube, Bing SERP
- Đa phương tiện & Lưu trữ: Image, Audio, ZIP
- Tích hợp LLM để mô tả hình ảnh (_llm_caption.py)

---

## V. Kho lưu trữ bloopai/vibe-kanban

Vibe-kanban là một ứng dụng quản lý công việc và lập trình tự động hóa - "Hệ điều hành dành cho AI Agent" (Agentic Kanban Board).

### Kiến trúc Đa nền tảng
- `crates/tauri-app/`: Ứng dụng Desktop chạy bằng Tauri v2
- `packages/local-web/` & `packages/web-core/`: Giao diện React + Tailwind CSS + Vite
- `packages/remote-web/`: Phiên bản web đám mây

### Hệ thống Máy chủ Đường truyền
- `crates/relay-tunnel` & `crates/relay-tunnel-core`: Tunnel Server trung gian
- `crates/relay-webrtc`: WebRTC Data Channels
- `crates/trusted-key-auth`: Mã hóa SPAKE2

### Trình Quản lý Thực thi AI Agent
- `executors/src/executors/claude.rs`: Kết nối Claude Code
- `executors/src/executors/cursor.rs`: Gọi Cursor AI Agent
- `executors/src/executors/gemini.rs` & `copilot.rs`: Gemini và GitHub Copilot

### Công nghệ Cơ sở Dữ liệu
- Electric SQL: Đồng bộ dữ liệu ngoại tuyến (Offline-first) với SQLite cục bộ và Postgres Cloud.

---

## VI. Kho lưu trữ minishlab/semble

Semble là một thư viện Python cung cấp công cụ tìm kiếm và định tuyến mã nguồn lai (Hybrid Code Search & Retrieval Engine) cho AI Agent.

### Kiến trúc Tìm kiếm Lai
- **Dense Retrieval (dense.py)**: Sử dụng embedding models để tìm kiếm ngữ nghĩa
- **Sparse Retrieval (sparse.py)**: Sử dụng BM25 để tìm kiếm từ khóa chính xác
- **Ensemble & Re-ranking (search.py)**: Kết hợp và xếp hạng kết quả

### Chiến lược Tối ưu Token
- `boosting.py`: Tăng điểm cho tệp tin quan trọng
- `penalties.py`: Giảm điểm tệp tin rác/dài
- `weighting.py`: Cân bằng Sparse và Dense

### MCP Server (src/semble/mcp.py)
Biến thư viện thành MCP Server cho Claude Code và Cursor.

---

## VII. Kho lưu trữ digitalplatdev/freedomain

FreeDomain là hệ thống mã nguồn mở cho phép triển khai nền tảng đăng ký và quản lý tên miền miễn phí.

### Cấu trúc Giao diện
- Đăng ký & Đăng nhập: register.html, login.html, reset_password.html
- Dashboard: overview.html, panel.html
- Đăng ký Tên miền: domainreg.html, domainreg_check.html, success.html
- Quản trị: domainmgr.html, usermgr.html

### Máy chủ WHOIS
- `whois.py`: Script Python triển khai máy chủ WHOIS độc lập
- `whois.html`: Giao diện web tra cứu WHOIS

### Luồng Vận hành & Tích hợp Cloudflare
1. Đăng ký Tài khoản & Chọn Tên miền
2. Trỏ Nameservers tới Cloudflare
3. Khai báo trên Cloudflare
4. Cấu hình bản ghi DNS (A, CNAME, TXT, MX)

---

## VIII. Kho lưu trữ github/spec-kit

GitHub spec-kit (Specification Kit) là bộ công cụ giúp các nhóm phát triển thiết kế, viết và quản lý tài liệu đặc tả kỹ thuật.

### Các thành phần
- **Templates**: PITCH_TEMPLATE.md, SPEC_TEMPLATE.md
- **Guidelines**: Hướng dẫn chấm điểm, quy trình đánh giá (Review Process)

### Lợi ích
- Đồng bộ hóa quy trình viết tài liệu
- Tránh sót dữ liệu về hiệu năng, bảo mật, accessibility

---

## IX. Kho lưu trữ mttpocock/skills (Matt Pocock)

Bộ kỹ năng huấn luyện AI Agent (tối ưu cho Claude Code) thực thi tác vụ kỹ nghệ phần mềm.

### Cấu trúc
- `.claude-plugin/plugin.json`: Tệp cấu hình plugin cho Claude Code
- `docs/adr/`: Architecture Decision Records
- `skills/engineering/`: diagnose, grill-with-docs, to-prd, to-issues, improve-codebase-architecture, tdd, prototype, triage
- `skills/productivity/`: handoff, write-a-skill, caveman
- `skills/personal/` & `misc/`: obsidian-vault, edit-article, git-guardrails-claude-code

### Sơ đồ Luồng (engineering/diagnose)
1. Analyze: Phân tích nhật ký lỗi
2. Gather Context: Đọc tệp tin liên quan
3. Hypothesize: Xây dựng giả thuyết nguyên nhân
4. HITL Loop: Vòng lặp kiểm thử phản hồi

### Quy tắc Kỹ thuật nâng cao
- TDD tuyệt đối (Red → Green → Refactor)
- Git Guardrails: Chặn lệnh Git nguy hiểm

---

## X. Kho lưu trữ every-inc/compound-engineering-plugin

Công cụ CLI và hệ thống plugin xâu chuỗi và hợp nhất các AI Agent thành quy trình kỹ nghệ phần mềm phối hợp.

### Kiến trúc Chuyển đổi Đa nền tảng
- `claude-to-codex.ts`, `claude-to-opencode.ts`, `claude-to-copilot.ts`, `claude-to-gemini.ts`, `claude-to-droid.ts`

### Bộ kỹ năng Kỹ nghệ Phối hợp
- `ce-plan`: Lập kế hoạch toàn diện
- `ce-work` & `ce-worktree`: Cô lập môi trường Git Worktree
- `ce-code-review` & `ce-doc-review`: Đánh giá đa tầng với Adversarial Review Agents
- `ce-optimize`: Vòng lặp tối ưu hóa
- `ce-demo-reel`: Ghi hình minh chứng tự động

### Quy trình Đóng gói & Phát hành
- Bun runtime, Release Please cho CI/CD

---

## XI. Kho lưu trữ fission-ai/openspec

OpenSpec là hệ thống thiết kế và quản lý đặc tả kỹ thuật theo hướng "Infrastructure-as-Code".

### Triết lý cốt lõi: "Spec-Driven Development"
- `openspec/`: Định nghĩa changes, initiatives, specs
- `schemas/`: schema.yaml định nghĩa cấu trúc tài liệu

### CLI
- `init`, `spec`, `change`, `validate`, `workspace`

### Tích hợp AI Agent
- `src/core/command-generation/adapters/`: Hỗ trợ Claude, Cline, Cursor, Gemini, OpenCode, Kiro

### Luồng xử lý Thay đổi
1. Proposal (proposal.md)
2. Design (design.md)
3. Spec (spec.md)
4. Validation (CLI validate)
5. Tasks (tasks.md)

---

## XII. Kho lưu trữ NextLevelBuilder/ui-ux-pro-max-skill

Bộ kỹ năng UI/UX cho AI Coding Agent, tập trung vào tự động hóa thiết kế và Design System.

### Kiến trúc Plugin
- `.claude-plugin/plugin.json`
- `.claude/skills/`: SKILL.md + tài liệu tham khảo + script

### Các nhóm Kỹ năng
- **brand**: Logo, bảng màu, font chữ, voice framework
- **design-system**: Design Tokens, Shadcn/UI, Tailwind integration
- **design**: UI/UX (CIP), icon, logo, mockup
- **slides**: Slide framework, copywriting formulas, layout patterns
- **ui-styling**: Component UI, responsive, accessibility

### Công cụ Hỗ trợ
- `scripts/`: extract-colors.cjs, sync-brand-to-tokens.cjs, validate-asset.cjs
- `data/`: colors.csv, typography.csv, design.csv

---

## XIII. Kho lưu trữ github/github-mcp-server

Máy chủ MCP (Go) cho phép AI Agent kết nối trực tiếp với GitHub API.

### Kiến trúc
- `cmd/`: Entry points (github-mcp-server, mcpcurl)
- `pkg/github/`: Logic nghiệp vụ GitHub
- `pkg/http/`: HTTP requests, OAuth, PAT

### Công cụ MCP
- Issues: CRUD, search
- Pull Requests: CRUD, review threads
- Repositories & Code: branches, files, tree
- Security: Code Scanning, Dependabot Alerts
- Workflows: GitHub Actions triggers

---

## XIV. Kho lưu trữ upstash/context7

Bộ công cụ (SDK, CLI, MCP Server) kết nối AI với dữ liệu ngữ cảnh từ mã nguồn và tài liệu.

### Cấu trúc Monorepo
- `packages/sdk/`: Thư viện lõi TypeScript
- `packages/cli/`: Công cụ CLI (setup, auth, skill)
- `packages/mcp/`: MCP Server
- `packages/tools-ai-sdk/`: Tích hợp Vercel AI SDK
- `packages/pi/`: Rules và skills cho AI Agent

### Luồng hoạt động
1. Setup & Auth
2. Index & Query (query-docs, resolve-library-id)
3. Hỗ trợ AI Agent qua Rules và MCP Server

---

## XV. Kho lưu trữ supabase-community/supabase-mcp

Bộ công cụ cho AI Agent tương tác với Supabase qua MCP.

### Cấu trúc Packages
- `packages/mcp-server-postgrest/`: Truy vấn database qua PostgREST
- `packages/mcp-server-supabase/`: Management API (projects, database, storage, edge functions)
- `packages/mcp-utils/`: Tiện ích chung

### Khả năng tích hợp
- Database Operations (pg-meta, extensions)
- Storage (file management)
- Edge Functions (invoke, test)
- Development Tools (projects, branching)
- Security & Debugging (logs, RLS)
