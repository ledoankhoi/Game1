---
description: Chạy toàn bộ Compound Engineering pipeline tự động — brainstorm → plan → work → code-review → compound → commit
agent: build
---

Chạy full autonomous pipeline sử dụng Compound Engineering skills.

## Pipeline

1. **Load context** — Đọc TODO.md, AGENTS.md, kiểm tra lint + git status
2. **Nếu cần brainstorm** — Dùng `ce-brainstorm` nếu task chưa rõ yêu cầu
3. **Plan** — Dùng `ce-plan` để tạo plan file chi tiết
4. **Work** — Dùng `ce-work` thực thi plan
5. **Code Review** — Dùng `ce-code-review` với `mode:autofix`
6. **Compound** — Dùng `ce-compound` lưu knowledge vào `docs/solutions/`
7. **Commit** — Dùng `ce-commit` để commit code
8. **Kiểm tra** — Chạy `npm run lint`, báo cáo kết quả
9. **Kết thúc** — Output `<promise>DONE</promise>` khi hoàn thành

## Nguyên tắc
- KHÔNG skip bước Plan — phải có plan trước khi code
- KHÔNG edit plan body — progress tracking qua git
- Luôn chạy lint sau mỗi thay đổi
